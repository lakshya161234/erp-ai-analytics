const tools = [
  {
    name: "sales.top_products",
    description: "Get top sold products by quantity in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive)",
      to: "ISO date string (exclusive)",
      limit: "number (default 5)"
    }
  },
  {
    name: "revenue.summary",
    description: "Get revenue and orders count in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive)",
      to: "ISO date string (exclusive)"
    }
  },
  {
    name: "revenue.by_day",
    description: "Get revenue by day in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive)",
      to: "ISO date string (exclusive)"
    }
  },
  {
    name: "clients.top_by_revenue",
    description: "Get top clients by revenue in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive)",
      to: "ISO date string (exclusive)",
      limit: "number (default 5)"
    }
  }
];

const toolsRegistry = {
  list() {
    return tools;
  }
};

module.exports = { toolsRegistry };
