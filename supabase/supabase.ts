// This is a mock Supabase client for development purposes
// In a real implementation, this would be replaced with the actual Supabase client

interface SupabaseClient {
  functions: {
    invoke: (name: string, options?: any) => Promise<{ data: any; error: any }>;
  };
}

// Create a mock Supabase client
export const supabase: SupabaseClient = {
  functions: {
    invoke: async (name: string, options?: any) => {
      console.log(`Invoking function: ${name}`, options);

      // Mock responses for different function calls
      if (name === "supabase-functions-get-plans") {
        return {
          data: [
            {
              id: "price_basic",
              object: "price",
              active: true,
              amount: 999,
              currency: "usd",
              interval: "month",
              interval_count: 1,
              product: "BASIC",
              created: Date.now(),
              livemode: false,
            },
            {
              id: "price_pro",
              object: "price",
              active: true,
              amount: 1999,
              currency: "usd",
              interval: "month",
              interval_count: 1,
              product: "PRO",
              created: Date.now(),
              livemode: false,
            },
            {
              id: "price_enterprise",
              object: "price",
              active: true,
              amount: 4999,
              currency: "usd",
              interval: "month",
              interval_count: 1,
              product: "ENTERPRISE",
              created: Date.now(),
              livemode: false,
            },
          ],
          error: null,
        };
      } else if (name === "supabase-functions-create-checkout") {
        return {
          data: {
            url: "https://checkout.stripe.com/mock-checkout",
          },
          error: null,
        };
      }

      // Default response for unhandled function calls
      return {
        data: null,
        error: { message: `Function ${name} not implemented in mock` },
      };
    },
  },
};
