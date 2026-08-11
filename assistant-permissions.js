export class PermissionManager {
  constructor(user = null) { this.setUser(user); }

  setUser(user) {
    this.user = user || { id: "anonymous", permissions: ["assistant:read"] };
  }

  has(permission) {
    const permissions = new Set(this.user?.permissions || []);
    return permissions.has("*") || permissions.has(permission);
  }

  assert(permission) {
    if (!this.has(permission)) {
      const error = new Error(`Acción no permitida: ${permission}`);
      error.code = "ASSISTANT_PERMISSION_DENIED";
      throw error;
    }
  }

  snapshot() {
    return { id: this.user?.id ?? null, permissions: [...(this.user?.permissions || [])] };
  }
}
