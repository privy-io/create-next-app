import React from "react";

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
  children?: React.ReactNode;
}

const Section = ({
  name,
  description,
  filepath,
  actions,
  children,
}: ISection) => {
  return (
    <div className="py-4 my-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center my-4">
        <h3 className="text-[20px] font-semibold">{name}</h3>
        <p className="bg-[#E0E7FF] px-2 py-1 rounded-md text-[14px] w-fit">
          @{filepath}
        </p>
      </div>
      <p className="text-[16px] font-light">{description}</p>

      {children && <div className="my-4">{children}</div>}

      <div className="flex flex-row flex-wrap gap-2 my-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.function}
            disabled={action.disabled}
            className={`button ${
              action.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Section;
