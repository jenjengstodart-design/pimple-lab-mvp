import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Product } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// --- Experiments ---

export function useCreateExperiment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.experiments.create.input>) => {
      const res = await fetch(api.experiments.create.path, {
        method: api.experiments.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create experiment');
      }
      return api.experiments.create.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useExperiment(id: number | null) {
  return useQuery({
    queryKey: [api.experiments.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.experiments.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch experiment');
      return api.experiments.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateExperiment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.experiments.update.input>) => {
      const url = buildUrl(api.experiments.update.path, { id });
      const res = await fetch(url, {
        method: api.experiments.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to update experiment');
      return api.experiments.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.experiments.get.path, data.id] });
      toast({ title: "Experiment updated", description: "Your changes have been saved." });
    },
  });
}

export function useAnalyzeExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.experiments.analyze.path, { id });
      const res = await fetch(url, {
        method: api.experiments.analyze.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error('Analysis failed');
      return await res.json(); // AnalysisResponse
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.experiments.get.path, id] });
    },
  });
}

export function useFollowUpExperiment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.experiments.followUp.input>) => {
      const url = buildUrl(api.experiments.followUp.path, { id });
      const res = await fetch(url, {
        method: api.experiments.followUp.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to submit follow-up');
      return api.experiments.followUp.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.experiments.get.path, data.id] });
      toast({ title: "Follow-up submitted", description: "Great job completing your experiment!" });
    },
  });
}

// --- Checkins ---

export function useCheckins(experimentId: number | null) {
  return useQuery({
    queryKey: [api.experiments.getCheckins.path, experimentId],
    queryFn: async () => {
      if (!experimentId) return [];
      const url = buildUrl(api.experiments.getCheckins.path, { id: experimentId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch checkins');
      return api.experiments.getCheckins.responses[200].parse(await res.json());
    },
    enabled: !!experimentId,
  });
}

export function useAddCheckin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ experimentId, ...data }: { experimentId: number } & z.infer<typeof api.experiments.addCheckin.input>) => {
      const url = buildUrl(api.experiments.addCheckin.path, { id: experimentId });
      const res = await fetch(url, {
        method: api.experiments.addCheckin.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to add checkin');
      return api.experiments.addCheckin.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.experiments.getCheckins.path, variables.experimentId] });
      toast({ title: "Check-in logged", description: "Keep up the good work!" });
    },
  });
}

// --- Products ---

export function useProducts(acneType?: string) {
  return useQuery({
    queryKey: [api.products.list.path, acneType],
    queryFn: async () => {
      let url = api.products.list.path;
      if (acneType) {
        url += `?acneType=${encodeURIComponent(acneType)}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch products');
      return (await res.json()) as Product[];
    },
    enabled: !!acneType,
  });
}
