const tools = [
  {
    name: "sales.top_products",
    description: "Get top sold products by quantity in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "today|yesterday|this_week|last_week|this_month|last_month|this_year|last_year|last_7_days|last_30_days|last_90_days (default last_30_days)",
      factory_id: "number (optional)",
      limit: "number (default 5)"
    }
  },
  {
    name: "sales.top_products_by_revenue",
    description: "Get top products by revenue (qty * price) in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      limit: "number (default 5)"
    }
  },
  {
    name: "revenue.summary",
    description: "Get revenue and orders count in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)"
    }
  },
  {
    name: "revenue.by_day",
    description: "Get revenue by day in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)"
    }
  },
  {
    name: "revenue.by_week",
    description: "Get revenue by week in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)"
    }
  },
  {
    name: "revenue.compare_periods",
    description: "Compare revenue between two date ranges.",
    argsSchema: {
      a_from: "ISO date string (inclusive) for period A",
      a_to: "ISO date string (exclusive) for period A",
      b_from: "ISO date string (inclusive) for period B",
      b_to: "ISO date string (exclusive) for period B",
      factory_id: "number (optional)"
    }
  },
  {
    name: "clients.top_by_revenue",
    description: "Get top clients by revenue in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      limit: "number (default 5)"
    }
  },

  // Material usage & manufacturing-style analytics
  {
    name: "materials.top_used",
    description: "Get top materials used (derived from BOM x sold qty) in a date range.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      limit: "number (default 5)"
    }
  },
  {
    name: "materials.usage_by_day",
    description: "Material usage by day (derived from BOM x sold qty).",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      material_id: "number (optional)"
    }
  },

  // Historical orders
  {
    name: "orders.history",
    description: "List historical orders with client + factory + total.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      client_id: "number (optional)",
      limit: "number (default 20)",
      include_items: "boolean (default false)"
    }
  },

  // Seasonal trends
  {
    name: "seasonal.sales_by_month",
    description: "Monthly revenue + order counts (seasonal trend).",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if months_back is provided",
      to: "ISO date string (exclusive)",
      months_back: "number (default 12)",
      factory_id: "number (optional)"
    }
  },

  // Market patterns / pricing trends
  {
    name: "market.pricing_trend",
    description: "Average unit price by month (pricing trend).",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if months_back is provided",
      to: "ISO date string (exclusive)",
      months_back: "number (default 12)",
      factory_id: "number (optional)",
      product_id: "number (optional)"
    }
  },

  // Customer behavior
  {
    name: "customers.repeat_stats",
    description: "Customer repeat purchase stats in a period (orders count, avg days between).",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      limit: "number (default 10)"
    }
  },
  {
    name: "customers.product_affinity",
    description: "Top products purchased by a specific customer in a period.",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)",
      client_id: "number (optional)",
      limit: "number (default 10)"
    }
  },

  // External signals (simple holiday tagging demo)
  {
    name: "external.holiday_impact",
    description: "Daily revenue with fixed-date holiday tags (demo).",
    argsSchema: {
      from: "ISO date string (inclusive) - optional if range is provided",
      to: "ISO date string (exclusive) - optional if range is provided",
      range: "same as above",
      factory_id: "number (optional)"
    }
  }
];

const toolsRegistry = {
  list() {
    return tools;
  }
};

module.exports = { toolsRegistry };
