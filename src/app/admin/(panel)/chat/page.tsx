import { ChatPanel } from "@/components/admin/ChatPanel";

export default function AdminChatPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl text-cream">AI Research</h1>
      <p className="mt-1 text-cream/60">
        Ask the assistant to research a BBQ joint and it will draft a full entry
        for your review. Try: <em>&ldquo;Research and add Franklin Barbecue.&rdquo;</em>
      </p>
      <div className="mt-6">
        <ChatPanel />
      </div>
    </div>
  );
}
