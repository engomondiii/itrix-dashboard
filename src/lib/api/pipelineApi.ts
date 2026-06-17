import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { PipelineBoard } from "@/types/pipeline";

export function getPipeline() {
  return apiGet<PipelineBoard>(API.pipeline);
}
