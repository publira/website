export interface Feature {
  readonly body: string;
  readonly title: string;
}

interface FeatureGridProps {
  readonly features: readonly Feature[];
}

export const FeatureGrid = ({ features }: FeatureGridProps) => (
  <ul className="border-border bg-border grid gap-px border-y sm:grid-cols-2 lg:grid-cols-3">
    {features.map((feature) => (
      <li className="bg-background px-5 py-6 sm:px-6" key={feature.title}>
        <h3 className="font-display text-foreground break-phrase text-lg">
          {feature.title}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {feature.body}
        </p>
      </li>
    ))}
  </ul>
);
