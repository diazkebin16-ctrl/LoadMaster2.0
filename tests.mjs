import assert from "node:assert/strict";
import { AIAssistant } from "./assistant-core.js";
import { registerMockTools, mockFailure, mockSlow } from "./mock-adapter.js";

function make(providerInstance, user={id:"U-1",permissions:["assistant:read"]}, cfg={}) {
  const a = new AIAssistant({ providerInstance, user, ...cfg });
  registerMockTools(x => a.registerTool(x));
  return a;
}
const provider = { async sendMessage({message, context}) { return {content:`OK:${message}`, meta:{history:context.history.length}}; } };

// 1 general
let a=make(provider); assert.equal((await a.sendMessage("hola")).content,"OK:hola");
// 2 orders
assert.equal((await a.runTool("getOrders",{})).data.length,3);
// 3 inventory
assert.equal((await a.runTool("searchInventory",{lowOnly:true})).data.length,1);
// 4 production
assert.equal((await a.runTool("getEmployeeProduction",{employeeId:"E-01"})).data.length,1);
// 5 no results
assert.equal((await a.runTool("getOrders",{status:"missing"})).data.length,0);
// 6 tool error
a.registerTool({name:"fail",permission:"assistant:read",execute:mockFailure});
await assert.rejects(()=>a.runTool("fail",{}));
// 7 timeout
a.registerTool({name:"slow",permission:"assistant:read",timeoutMs:10,execute:mockSlow});
await assert.rejects(()=>a.runTool("slow",{}), e=>e.code==="ASSISTANT_TOOL_TIMEOUT");
// 8 context
await a.sendMessage("dos"); assert.ok(a.getHistory().length>=4);
// 9 no permission
let b=make(provider,{id:"U-2",permissions:[]});
await assert.rejects(()=>b.runTool("getOrders",{}), e=>e.code==="ASSISTANT_PERMISSION_DENIED");
// 10 write confirmation
a.registerTool({name:"writeDemo",operation:"write",permission:"assistant:read",execute:async()=>({written:true})});
let pending=await a.runTool("writeDemo",{x:1}); assert.equal(pending.confirmationRequired,true);
let done=await a.confirmAction(pending.action); assert.equal(done.data.written,true);
console.log("10/10 pruebas mínimas completadas.");
