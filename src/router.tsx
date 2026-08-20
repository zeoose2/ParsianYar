import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => createRouter({ routeTree, context: { queryClient: new QueryClient() }, scrollRestoration: true, defaultPreloadStaleTime: 0 });
