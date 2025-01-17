import { FC, useEffect, useRef } from 'react';
import {
  createJSONEditor,
  JSONEditorPropsOptional,
  JsonEditor,
} from 'vanilla-jsoneditor';

export type Props = {} & JSONEditorPropsOptional;

function filterUnchangedProps(
  props: JSONEditorPropsOptional,
  prevProps: JSONEditorPropsOptional
): JSONEditorPropsOptional {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) =>
        value !== prevProps[key as keyof JSONEditorPropsOptional]
    )
  );
}

const ValueEditor: FC<Props> = (props) => {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const refEditor = useRef<JsonEditor | null>(null);
  const refPrevProps = useRef<JSONEditorPropsOptional>(props);

  useEffect(() => {
    // create editor
    refEditor.current = createJSONEditor({
      target: refContainer.current as HTMLDivElement,
      props,
    });

    return () => {
      // destroy editor
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  // update props
  useEffect(() => {
    if (refEditor.current) {
      // only pass the props that actually changed
      // since the last time to prevent syncing issues
      const changedProps = filterUnchangedProps(props, refPrevProps.current);
      refEditor.current.updateProps(changedProps);
      refPrevProps.current = props;
    }
  }, [props]);

  return <div className="vanilla-jsoneditor-react" ref={refContainer}></div>;
};

export default ValueEditor;
