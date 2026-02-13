import Canvas from './canvas';
import { ChangeProvider } from './providers/changes';


const EntityDiagram = () => {
  return (
    <ChangeProvider>
      <Canvas />
    </ChangeProvider>
  );
};

export default EntityDiagram;
