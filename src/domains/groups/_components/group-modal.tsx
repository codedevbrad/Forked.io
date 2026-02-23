"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { GroupForm } from "@/src/domains/groups/_components/group-form";
import { getIngredientDisplayName } from "@/src/domains/ingredients/utils";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/src/components/ui/button";

type GroupModalProps =
  | {
      mode: "create";
      group?: never;
      trigger?: React.ReactNode;
    }
  | {
      mode: "edit";
      group: {
        id: string;
        name: string;
        ingredients: Array<{
          id: string;
          shopIngredientId?: string | null;
          shopIngredient?: { name: string } | null;
          customUserIngredient?: { name: string } | null;
        }>;
      };
      trigger?: React.ReactNode;
    };

export function GroupModal({ mode, group, trigger }: GroupModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger != null ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant={isCreate ? "default" : "ghost"}
            size={isCreate ? "default" : "sm"}
          >
            {isCreate ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create group
              </>
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create ingredient group" : "Edit ingredient group"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a group to organize your ingredients."
              : "Update the group name and ingredients."}
          </DialogDescription>
        </DialogHeader>
        {isCreate ? (
          <GroupForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        ) : (
          <GroupForm
            groupId={group.id}
            initialName={group.name}
            initialIngredients={group.ingredients.map((i) => ({
              id: i.id,
              name: getIngredientDisplayName(i),
              shopIngredientId: i.shopIngredientId,
            }))}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
