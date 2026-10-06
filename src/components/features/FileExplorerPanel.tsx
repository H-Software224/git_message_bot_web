"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, File as FileIcon } from "lucide-react";
import type { FileTreeNode } from "@/lib/types";

export function FileExplorerPanel() {
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/git/tree")
      .then((res) => {
        if (!res.ok) throw new Error("파일 구조를 불러오지 못했습니다.");
        return res.json();
      })
      .then(setTree)
      .catch((err) => setError(err.message));
  }, []);

  async function openFile(path: string) {
    setSelected(path);
    setContent(null);
    setContentError(null);
    try {
      const res = await fetch(`/api/git/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "파일을 불러오지 못했습니다.");
      setContent(data.content);
    } catch (err) {
      setContentError(err instanceof Error ? err.message : String(err));
    }
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        저장소 파일/폴더 구조입니다. 파일을 클릭하면 내용을 미리 볼 수 있습니다.
      </p>
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="w-1/2 overflow-y-auto rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800">
          {tree ? (
            <TreeNode node={tree} depth={0} onSelectFile={openFile} selected={selected} />
          ) : (
            <p className="text-xs text-zinc-400">불러오는 중...</p>
          )}
        </div>
        <div className="w-1/2 overflow-y-auto rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
          {!selected && <p className="text-xs text-zinc-400">파일을 선택하세요.</p>}
          {selected && contentError && <p className="text-xs text-red-500">{contentError}</p>}
          {selected && content !== null && (
            <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  onSelectFile,
  selected,
}: {
  node: FileTreeNode;
  depth: number;
  onSelectFile: (path: string) => void;
  selected: string | null;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "file") {
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        style={{ paddingLeft: depth * 14 }}
        className={`flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          selected === node.path ? "bg-zinc-100 dark:bg-zinc-800" : ""
        }`}
      >
        <FileIcon size={13} className="shrink-0 text-zinc-400" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: depth * 14 }}
        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        <Folder size={13} className="shrink-0 text-amber-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {open &&
        node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            onSelectFile={onSelectFile}
            selected={selected}
          />
        ))}
    </div>
  );
}
