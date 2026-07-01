import { RestaurantForm } from "@/components/admin/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-4xl text-cream">New Restaurant</h1>
      <p className="mb-6 text-sm text-cream/60">
        Create the entry first; you can add photos once it&apos;s saved.
      </p>
      <RestaurantForm />
    </div>
  );
}
