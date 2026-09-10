import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EntityForm from 'components/form/entity/EntityForm/EntityForm';
import EntityIndex from 'components/form/entity/EntityIndex/EntityIndex';
import EntityDetails from 'components/form/entity/EntityDetails/EntityDetails';

const EntityRoutes: React.FC<{ entity: string }> = ({ entity }) => {
  return (
    <Routes>
      <Route path="/" element={<EntityIndex entity={entity} />} />
      <Route path="/create" element={<EntityForm entity={entity} />} />
      <Route path="/:id/edit" element={<EntityForm entity={entity} />} />
      <Route path="/:id" element={<EntityDetails entity={entity} />} />
    </Routes>
  );
};

export default EntityRoutes;