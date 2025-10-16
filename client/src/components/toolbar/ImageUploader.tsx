/**
 * 图片上传组件 (使用 react-dropzone)
 */

import { type FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useEditorStore } from '@/store/editorStore';

interface ImageUploaderProps {
  onClose: () => void;
}

export const ImageUploader: FC<ImageUploaderProps> = ({ onClose }) => {
  const addNode = useEditorStore((state) => state.addNode);
  const getPlugin = useEditorStore((state) => state.getPlugin);
  const viewport = useEditorStore((state) => state.viewport);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const src = e.target?.result as string;

          // 加载图片获取实际尺寸
          const img = new window.Image();
          img.src = src;
          img.onload = () => {
            const imagePlugin = getPlugin('image');
            if (imagePlugin?.createNode) {
              // 保持宽高比，限制最大尺寸以减少存储空间
              const maxWidth = 400;
              const maxHeight = 400;
              const ratio = img.width / img.height;

              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                width = maxWidth;
                height = width / ratio;
              }

              if (height > maxHeight) {
                height = maxHeight;
                width = height * ratio;
              }

              const newNode = imagePlugin.createNode({
                position: {
                  x: (-viewport.x + 400) / viewport.zoom,
                  y: (-viewport.y + 300) / viewport.zoom,
                },
                size: {
                  width,
                  height,
                },
                props: { src },
              });
              addNode(newNode);
            }
          };
        };

        reader.readAsDataURL(file);
      }

      onClose();
    },
    [addNode, getPlugin, viewport, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h2 className="mb-4 font-bold text-gray-900 text-xl">上传图片</h2>

        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-gray-600">
            {isDragActive ? (
              <p className="font-medium text-blue-600">释放以上传图片...</p>
            ) : (
              <>
                <p className="mb-2 font-medium">拖拽图片到这里</p>
                <p className="text-gray-500 text-sm">或点击选择文件</p>
                <p className="mt-2 text-gray-400 text-xs">支持 PNG, JPG, GIF, WebP, SVG</p>
                <p className="text-gray-400 text-xs">最大 5MB</p>
              </>
            )}
          </div>
        </div>

        <button
          className="mt-4 w-full rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
          onClick={onClose}
          type="button"
        >
          取消
        </button>
      </div>
    </div>
  );
};
