import type { ModelFormulaDefinition } from './types';

interface FormulaPanelProps<TValues extends object> {
  formula: ModelFormulaDefinition<TValues>;
  activeField?: keyof TValues & string;
}

export function FormulaPanel<TValues extends object>({ formula, activeField }: FormulaPanelProps<TValues>) {
  return (
    <section className="model-formula-panel" aria-label={`${formula.title}公式`}>
      <div className="model-formula-panel__heading">
        <span className="model-panel-heading__eyebrow">FORMULA</span>
        <h3>{formula.title}</h3>
        {formula.description ? <p>{formula.description}</p> : null}
      </div>
      <div className="model-formula-panel__body">
        {formula.rows.map((row, rowIndex) => (
          <div className="model-formula-row" key={rowIndex}>
            {row.tokens.map((token, tokenIndex) => {
              const active = token.fieldKey !== undefined && token.fieldKey === activeField;
              return (
                <span
                  className={[
                    'model-formula-token',
                    token.fieldKey ? 'model-formula-token--field' : '',
                    active ? 'model-formula-token--active' : '',
                    token.className ?? '',
                  ].filter(Boolean).join(' ')}
                  key={`${token.text}-${tokenIndex}`}
                >
                  {token.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
