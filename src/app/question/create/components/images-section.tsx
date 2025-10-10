import * as React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TextField from "@/components/form-field/text-field";

interface ImageData {
  url?: string;
  label?: string;
  name?: string;
}

interface FormValues {
  images: ImageData[];
}

interface ImagesSectionProps {
  setImageFile: (idx: number, file: File | null) => void;
}

export default function ImagesSection({ setImageFile }: ImagesSectionProps) {
  const { control, watch } = useFormContext<FormValues>();
  const images = watch("images");

  const imagesArray = useFieldArray({ control, name: "images" as never });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Images</Label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            imagesArray.append({ url: "", label: "", name: "" })
          }
        >
          Add image
        </Button>
      </div>
      {images.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No images added.
        </div>
      ) : (
        <div className="grid gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(i, e.target.files?.[0] ?? null)
                  }
                />
              </div>
              <TextField
                name={`images.${i}.label`}
                placeholder="Image label"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => imagesArray.remove(i)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
