import { MarkerType } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  NODE_COLORS,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function createNode(
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  colorIndex: number,
  shape: CanvasNode["data"]["shape"] = "rectangle",
): CanvasNode {
  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    data: {
      label,
      color: NODE_COLORS[colorIndex],
      shape,
    },
    style: {
      width,
      height,
    },
  };
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: CANVAS_EDGE_TYPE,
    data: { label },
    markerEnd: {
      color: "var(--text-primary)",
      height: 16,
      type: MarkerType.ArrowClosed,
      width: 16,
    },
    style: {
      stroke: "var(--text-primary)",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 1.5,
    },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices-platform",
    name: "Microservices Platform",
    description:
      "A customer-facing application split across API gateway, services, data stores, cache, and observability.",
    nodes: [
      createNode("ms-client", "Web / Mobile", 0, 120, 156, 72, 1, "pill"),
      createNode("ms-gateway", "API Gateway", 230, 120, 160, 72, 7, "hexagon"),
      createNode("ms-auth", "Auth Service", 500, 0, 156, 72, 2, "rectangle"),
      createNode("ms-orders", "Order Service", 500, 120, 156, 72, 3, "rectangle"),
      createNode("ms-billing", "Billing Service", 500, 240, 156, 72, 5, "rectangle"),
      createNode("ms-db", "Service DBs", 760, 80, 148, 104, 6, "cylinder"),
      createNode("ms-cache", "Redis Cache", 760, 240, 148, 92, 7, "cylinder"),
      createNode("ms-observe", "Logs + Metrics", 500, 400, 176, 72, 0, "pill"),
    ],
    edges: [
      createEdge("ms-client-gateway", "ms-client", "ms-gateway", "HTTPS"),
      createEdge("ms-gateway-auth", "ms-gateway", "ms-auth"),
      createEdge("ms-gateway-orders", "ms-gateway", "ms-orders"),
      createEdge("ms-gateway-billing", "ms-gateway", "ms-billing"),
      createEdge("ms-auth-db", "ms-auth", "ms-db"),
      createEdge("ms-orders-db", "ms-orders", "ms-db"),
      createEdge("ms-billing-db", "ms-billing", "ms-db"),
      createEdge("ms-orders-cache", "ms-orders", "ms-cache"),
      createEdge("ms-auth-observe", "ms-auth", "ms-observe"),
      createEdge("ms-orders-observe", "ms-orders", "ms-observe"),
      createEdge("ms-billing-observe", "ms-billing", "ms-observe"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "A delivery path from source control through build, tests, artifacts, deployment, and runtime monitoring.",
    nodes: [
      createNode("cicd-repo", "Source Repo", 0, 120, 148, 72, 1, "hexagon"),
      createNode("cicd-ci", "CI Runner", 220, 120, 148, 72, 7, "rectangle"),
      createNode("cicd-tests", "Test Suite", 440, 0, 148, 72, 6, "diamond"),
      createNode("cicd-build", "Build Image", 440, 160, 148, 72, 3, "rectangle"),
      createNode("cicd-registry", "Artifact Registry", 680, 160, 164, 104, 2, "cylinder"),
      createNode("cicd-deploy", "Deploy Job", 930, 160, 148, 72, 5, "rectangle"),
      createNode("cicd-prod", "Production", 1160, 160, 148, 72, 7, "pill"),
      createNode("cicd-monitor", "Monitoring", 930, 340, 164, 72, 0, "rectangle"),
    ],
    edges: [
      createEdge("cicd-repo-ci", "cicd-repo", "cicd-ci", "push"),
      createEdge("cicd-ci-tests", "cicd-ci", "cicd-tests"),
      createEdge("cicd-tests-build", "cicd-tests", "cicd-build"),
      createEdge("cicd-build-registry", "cicd-build", "cicd-registry"),
      createEdge("cicd-registry-deploy", "cicd-registry", "cicd-deploy"),
      createEdge("cicd-deploy-prod", "cicd-deploy", "cicd-prod"),
      createEdge("cicd-prod-monitor", "cicd-prod", "cicd-monitor"),
      createEdge("cicd-monitor-deploy", "cicd-monitor", "cicd-deploy", "alerts"),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description:
      "An asynchronous architecture with producers, event broker, consumers, read models, notifications, and analytics.",
    nodes: [
      createNode("eda-api", "Command API", 0, 150, 156, 72, 1, "pill"),
      createNode("eda-producer", "Event Producer", 230, 150, 156, 72, 7, "rectangle"),
      createNode("eda-broker", "Event Broker", 490, 150, 176, 92, 2, "hexagon"),
      createNode("eda-inventory", "Inventory Consumer", 760, 0, 176, 72, 6, "rectangle"),
      createNode("eda-notify", "Notification Worker", 760, 150, 176, 72, 5, "rectangle"),
      createNode("eda-analytics", "Analytics Worker", 760, 300, 176, 72, 3, "rectangle"),
      createNode("eda-read", "Read Model", 1020, 0, 156, 104, 7, "cylinder"),
      createNode("eda-warehouse", "Warehouse", 1020, 300, 156, 104, 0, "cylinder"),
    ],
    edges: [
      createEdge("eda-api-producer", "eda-api", "eda-producer", "command"),
      createEdge("eda-producer-broker", "eda-producer", "eda-broker", "event"),
      createEdge("eda-broker-inventory", "eda-broker", "eda-inventory"),
      createEdge("eda-broker-notify", "eda-broker", "eda-notify"),
      createEdge("eda-broker-analytics", "eda-broker", "eda-analytics"),
      createEdge("eda-inventory-read", "eda-inventory", "eda-read"),
      createEdge("eda-analytics-warehouse", "eda-analytics", "eda-warehouse"),
    ],
  },
];
