interface IAction {
  name: string;
  function: () => void;
  disabled?: boolean;
}

interface ISection {
  name: string;
  description?: string;
  filepath?: string;
  actions: IAction[];
}

const Section = ({ name, description, filepath, actions }: ISection) => {
  return (
    <div className="py-4 my-4">
      <div className="flex flex-row gap-2 items-center my-4">
        <h3 className="text-[20px] font-semibold">{name}</h3>
        <pre className="bg-white px-2 py-1 rounded-full text-[12px]">
          @{filepath}
        </pre>
      </div>
      <p className="text-[16px] font-light">{description}</p>

      <div className="flex flex-row flex-wrap gap-2 my-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.function}
            disabled={action.disabled}
            className={`button ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Section;
