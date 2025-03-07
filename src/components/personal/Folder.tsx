import React from "react";

interface FolderProps {
  name: string;
  onOpen: () => void;
  disabled?: boolean;
  clicked?: boolean;
  onClick: () => void;
  id: string;
}

export const Folder: React.FC<FolderProps> = ({
  name,
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

  return (
    <div
      id={id}
      className={`file-container flex flex-col items-center justify-center p-2 ${!disabled ? "cursor-pointer" : ""}`}
      onDoubleClick={!disabled ? handleDoubleClick : undefined}
      onClick={!disabled ? handleClick : undefined}
    >
      <img
        src={
          disabled
            ? "/macos_assets/folder_disabled.png"
            : clicked
              ? "/macos_assets/folder_clicked.png"
              : "/macos_assets/folder.png"
        }
        alt="Folder"
        draggable="false"
      />
      <p
        className={`${!clicked ? "text-black bg-white" : "text-white bg-black"} font-medium text-sm px-2 text-xl`}
      >
        {name}
      </p>
    </div>
  );
};
