export interface Feature {
  readonly body: string;
  readonly title: string;
}

interface FeatureGridProps {
  readonly features: readonly Feature[];
}

export const FeatureGrid = ({ features }: FeatureGridProps) => (
  <ul className="border-line bg-line grid gap-px border-y sm:grid-cols-2 lg:grid-cols-3">
    {features.map((feature) => (
      <li className="bg-canvas px-5 py-6 sm:px-6" key={feature.title}>
        <h3 className="font-display text-ink text-lg">{feature.title}</h3>
        <p className="text-ink-soft mt-2 text-sm leading-relaxed">
          {feature.body}
        </p>
      </li>
    ))}
  </ul>
);
