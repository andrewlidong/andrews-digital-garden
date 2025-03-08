import React from "react";
import { Rnd } from "react-rnd";

interface FileProps {
  name: string;
  initialPosition?: { x: number; y: number };
  onOpen: () => void;
  disabled?: boolean;
  clicked?: boolean;
  onClick: () => void;
  id: string;
}

export const File: React.FC<FileProps> = ({
  name,
  initialPosition,
  onOpen,
  disabled = false,
  clicked = false,
  onClick,
  id,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen();
  };

  const FileContent = (
    <div
      id={id}
      className={`file-container flex items-center p-2 ${!disabled ? "cursor-pointer" : ""} ${clicked ? "bg-gray-800 bg-opacity-50 rounded" : ""}`}
      onDoubleClick={!disabled ? handleDoubleClick : undefined}
      onClick={!disabled ? handleClick : undefined}
    >
      <div className="mr-2 text-blue-400 text-xl">
        📄
      </div>
      <p
        className={`font-mono ${disabled ? "text-gray-500" : clicked ? "text-blue-300" : "text-white"} text-lg`}
      >
        {name}
      </p>
    </div>
  );

  if (initialPosition) {
    return (
      <Rnd
        default={{
          x: initialPosition.x,
          y: initialPosition.y,
          width: 200,
          height: 40,
        }}
        enableResizing={false}
      >
        {FileContent}
      </Rnd>
    );
  }

  return FileContent;
};
