export class TricountHandler {
  /** Gibt den Titel des Tricounts zurück */
  static getTitle(data: any): string {
    return data.Response[0].Registry.title;
  }
  

    static getMetaData(data: any) {
    if (!data.Response || !data.Response[0] || !data.Response[0].Registry) {
        return null; // oder ein leeres Objekt oder Fehlermeldung
    }
    const r = data.Response[0].Registry;
    return {
      id: r.id,
      created: r.created,
      updated: r.updated,
      uuid: r.uuid,
      currency: r.currency,
      emoji: r.emoji,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      last_activity_timestamp: r.last_activity_timestamp,
      public_identifier_token: r.public_identifier_token
    };
  }

  static parseData(data: any) {
    const registry = data.Response[0].Registry;
    const memberships = registry.memberships.map((m: any) => ({
      name: m.RegistryMembershipNonUser.alias.display_name,
      uuid: m.RegistryMembershipNonUser.uuid,
      status: m.RegistryMembershipNonUser.status
    }));

    const transactions = registry.all_registry_entry.map((e: any) => {
      const t = e.RegistryEntry;
      return {
        id: t.id,
        created: t.created,
        updated: t.updated,
        uuid: t.uuid,
        amount: t.amount.value,
        currency: t.amount.currency,
        description: t.description || "",
        date: t.date,
        category: t.category,
        category_custom: t.category_custom,
        type: t.type,
        type_transaction: t.type_transaction,
        whoPaid: t.membership_owned.RegistryMembershipNonUser.alias.display_name,
        allocations: t.allocations.map((a: any) => ({
          name: a.membership.RegistryMembershipNonUser.alias.display_name,
          uuid: a.membership.RegistryMembershipNonUser.uuid,
          value: a.amount.value,
          currency: a.amount.currency,
          type: a.type,
          share_ratio: a.share_ratio
        })),
        attachment: t.attachment
      };
    });

    return { memberships, transactions };
  }

  static calculateStats(memberships: any[], transactions: any[]) {
    const perPerson: Record<string, number> = {};
    let total = 0;
    for (const t of transactions) {
      total += Math.abs(parseFloat(t.amount));
      perPerson[t.whoPaid] = (perPerson[t.whoPaid] || 0) + Math.abs(parseFloat(t.amount));
    }
    return {
      total: total.toFixed(2),
      num_transactions: transactions.length,
      per_person: perPerson
    };
  }
}
