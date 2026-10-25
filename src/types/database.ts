export type PlanTier = "starter" | "growth" | "max";
export type SubscriptionStatus = "active" | "canceled" | "past_due";
export type BusinessStage = "not_started" | "starting" | "running";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "not_started" | "in_progress" | "completed";
export type UsageFeatureKey = "roadmap_generation" | "ai_assistant_message";
export type ConsultationStatus = "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_stage: BusinessStage;
  industry_category: string;
  product_description: string;
  target_customer: string;
  operational_location: string;
  estimated_capital: string;
  business_goals: string;
  main_challenges: string;
  prior_experience: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_tier: PlanTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  feature_key: UsageFeatureKey;
  usage_date: string;
  used_count: number;
  created_at: string;
  updated_at: string;
}

export interface RiskMitigationItem {
  risk: string;
  impact: "low" | "medium" | "high";
  mitigation: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  version: number;
  title: string;
  business_name: string;
  business_stage: BusinessStage;
  industry_category: string;
  target_customer: string;
  operational_location: string;
  estimated_capital: string;
  input_payload: Record<string, unknown>;
  business_summary: string;
  problem_opportunity_analysis: string;
  target_market_analysis: string;
  validation_or_evaluation: string;
  value_proposition: string;
  business_model_revenue: string;
  capital_cost_estimation: string;
  marketing_acquisition_strategy: string;
  operational_plan: string;
  risks_and_mitigation: RiskMitigationItem[];
  next_priority_actions: string[];
  disclaimer_note: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapStage {
  id: string;
  roadmap_id: string;
  user_id: string;
  stage_order: number;
  title: string;
  goal: string;
  description: string;
  estimated_duration: string;
  created_at: string;
  tasks?: RoadmapTask[];
}

export interface RoadmapTask {
  id: string;
  roadmap_id: string;
  stage_id: string;
  user_id: string;
  task_order: number;
  title: string;
  description: string;
  priority: TaskPriority;
  estimated_duration: string;
  expected_output: string;
  success_indicator: string;
  dependency: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  roadmap_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  content: string;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, "id" | "full_name">;
  category?: Pick<ForumCategory, "id" | "slug" | "name">;
  user_has_upvoted?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Pick<Profile, "id" | "full_name">;
}

export interface ForumVote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Mentor {
  id: string;
  full_name: string;
  initials: string;
  role_headline: string;
  expertise_tags: string[];
  experience_summary: string;
  years_of_experience: number;
  consultation_language: string;
  session_duration_minutes: number;
  is_demo_data: boolean;
  created_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
  created_at: string;
}

export interface ConsultationBooking {
  id: string;
  user_id: string;
  mentor_id: string;
  availability_id: string;
  business_topic: string;
  question_notes: string;
  status: ConsultationStatus;
  meeting_notes: string | null;
  created_at: string;
  updated_at: string;
  mentor?: Mentor;
  availability?: MentorAvailability;
}

