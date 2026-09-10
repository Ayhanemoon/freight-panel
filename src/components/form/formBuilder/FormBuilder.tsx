import React from 'react';
import EntityRoutes from 'routes/EntityRoutes';

interface FormBuilderProps {
  entity: string;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ entity }) => {
  return (
    <div className="form-builder">
      <EntityRoutes entity={entity} />
    </div>
  );
};

export default FormBuilder;