"use client";

import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { DiscoverVideoForm } from "./discover-video-form";
import { useDiscoverVideos } from "../_contexts/useDiscoverVideos";
import { deleteDiscoverVideoAction } from "../db";
import { DiscoverVideo, DiscoverType } from "@prisma/client";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export function DiscoverVideoManagement() {
  const { data: videos, isLoading, mutate } = useDiscoverVideos();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<DiscoverVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<DiscoverVideo | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (video: DiscoverVideo) => {
    setEditingVideo(video);
  };

  const handleCloseEdit = () => {
    setEditingVideo(null);
  };

  const handleDelete = (video: DiscoverVideo) => {
    setDeletingVideo(video);
  };

  const handleConfirmDelete = () => {
    if (!deletingVideo) return;

    startTransition(async () => {
      const result = await deleteDiscoverVideoAction(deletingVideo.id);
      if (result.success) {
        await mutate();
        setDeletingVideo(null);
      }
    });
  };

  const getTypeLabel = (type: DiscoverType) => {
    switch (type) {
      case DiscoverType.YOUTUBE:
        return "YouTube";
      case DiscoverType.TIKTOK:
        return "TikTok";
      case DiscoverType.INSTAGRAM:
        return "Instagram";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Discover Videos</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Video</DialogTitle>
              <DialogDescription>
                Add a new discover video from YouTube, TikTok, or Instagram
              </DialogDescription>
            </DialogHeader>
            <DiscoverVideoForm
              onSuccess={() => setCreateOpen(false)}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading videos...</div>
      ) : videos && videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{video.name}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {getTypeLabel(video.type)}
                  </span>
                </div>
                {video.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {video.description}
                  </p>
                )}
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  {video.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(video)}
                  disabled={isPending}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(video)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-8 border rounded-lg">
          No videos found. Add your first video to get started.
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video information
            </DialogDescription>
          </DialogHeader>
          {editingVideo && (
            <DiscoverVideoForm
              videoId={editingVideo.id}
              initialName={editingVideo.name}
              initialDescription={editingVideo.description}
              initialUrl={editingVideo.url}
              initialType={editingVideo.type}
              onSuccess={handleCloseEdit}
              onCancel={handleCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingVideo}
        onOpenChange={(open) => !open && setDeletingVideo(null)}
        title="Delete Video"
        description={`Are you sure you want to delete "${deletingVideo?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
