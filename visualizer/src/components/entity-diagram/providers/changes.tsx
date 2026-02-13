import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useConnector } from '../hooks';
import {
  ChangeEvent,
  NodeEntity,
  LinkData,
  LocationData,
  NodeData,
} from '../hooks/types';
import { debounce } from 'lodash';

interface ChangeContextType {
  trackLinkChange: (change: ChangeEvent) => void;
  trackNodeChange: (change: ChangeEvent) => void;
  linkData: LinkData[];
  nodeData: NodeEntity[];
}

const ChangeContext = createContext<ChangeContextType | undefined>(undefined);

export const ChangeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { fetchAll, saveLinkData, saveLocationData, linkData, locationData, schemas } = useConnector();

  const [data, setData] = useState<NodeEntity[]>();
  const [links, setLinks] = useState<LinkData[]>();
  const [_, setLocations] = useState<LocationData[]>();

  const debouncedSaveLinkData = useCallback(debounce(saveLinkData, 1000), [
    saveLinkData,
  ]);
  const debouncedSaveLocationData = useCallback(
    debounce(saveLocationData, 1000),
    [saveLocationData]
  );

  const trackLinkChange = useCallback(
    (change: ChangeEvent) => {
      let isChanged = false;
      setLinks((prevData) => {
        let newData = JSON.parse(JSON.stringify(prevData)) as LinkData[]; // Deep copy to ensure immutability
        switch (change.type) {
          case 'linkAdded':
            // Check if the link already exists before adding
            const linkExists = newData.some((link) => link.key === change.key);
            if (!linkExists) {
              newData.push({
                key: change.key,
                from: change.fromNode,
                to: change.toNode,
                text: change.text,
                toText: change.toText,
              });
              isChanged = true;
            }
            break;

          case 'linkModified':
            const linkIndex = newData.findIndex(
              (link) => link.key === change.key
            );
            if (linkIndex !== -1) {
              newData[linkIndex] = {
                ...newData[linkIndex],
                from: change.newFromNode,
                to: change.newToNode,
                text: change.text,
                toText: change.toText,
              };
              isChanged = true;
            }
            break;

          case 'linkRemoved':
            newData = newData.filter((link) => link.key !== change.key);
            isChanged = true;
            break;

          case 'linkTextChanged':
            const textLinkIndex = newData.findIndex(
              (link) => link.key === change.key
            );
            if (textLinkIndex !== -1) {
              if (change.isFromText) {
                newData[textLinkIndex].text = change.newText;
              } else {
                newData[textLinkIndex].toText = change.newText;
              }

              isChanged = true;
            }
            break;
        }

        if (isChanged) {
          debouncedSaveLinkData(newData ?? []);
        }

        return newData;
      });
    },
    [links]
  );

  const trackNodeChange = useCallback(
    (change: ChangeEvent) => {
      let isChanged = false;
      setLocations((prevData) => {
        const newData = JSON.parse(JSON.stringify(prevData)) as LocationData[]; // Deep copy to ensure immutability
        switch (change.type) {
          case 'nodePositionChanged':
            const nodeIndexInData = data?.findIndex(
              (node) => node.key === change.nodeKey
            );
            const nodeIndexInLocations = newData?.findIndex(
              (node) => node.key === change.nodeKey
            );

            if (nodeIndexInLocations !== -1) {
              newData[nodeIndexInLocations].loc = change.loc;
              isChanged = true;
            } else if (nodeIndexInData !== -1) {
              newData.push({
                key: change.nodeKey,
                loc: change.loc,
              });
              isChanged = true;
            }
            break;
        }

        if (isChanged) {
          debouncedSaveLocationData(newData ?? []);
        }

        return newData;
      });
    },
    [data]
  );

  useEffect(() => {
    setLinks(linkData ?? []);
    setLocations(locationData ?? []);
    fetchAll().then((result) => {
      const { productTypes, types } = result;
      if (!productTypes || !types) return;
      setData([...schemas, ...productTypes, ...types]);
    });
  }, [linkData, locationData, schemas]);

  return (
    <ChangeContext.Provider
      value={{
        trackLinkChange,
        trackNodeChange,
        nodeData: data ?? [],
        linkData: links ?? [],
      }}
    >
      {(!data || !links) ? null : children}
    </ChangeContext.Provider>
  );
};

export const useChange = () => {
  const context = useContext(ChangeContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within App');
  }
  return context;
};
