export default function PageHeader({ actions, description, eyebrow, title }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-sm font-semibold text-workshop-600">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
