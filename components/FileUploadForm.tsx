import { FormProvider, useForm } from "react-hook-form";
import { useMutation } from "react-query";

interface FileUploadFormValues {
  file: FileList;
}

interface FileUploadPayload {
  requestBody: FormData;
}

async function uploadFile({ requestBody }: FileUploadPayload): Promise<void> {
  const response = await fetch(`/upload`, {
    method: "POST",
    body: requestBody,
  });
  return response.json();
}

export const FileUploadForm = () => {
  const useFormProps = useForm<FileUploadFormValues>();
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useFormProps;
  const file = watch("file");

  const uploadMutation = useMutation((payload: FileUploadPayload) =>
    uploadFile(payload)
  );

  async function onSubmit(data: FileUploadFormValues) {
    const { file } = data;
    if (!file[0]) throw new Error("No file provided");

    // Use FormData to make the POST request use same format a form would use if the encoding type were set to "multipart/form-data"
    const formData = new FormData();
    formData.append("file", file[0]);

    try {
      await uploadMutation.mutateAsync({ requestBody: formData });
      console.log("File received. It will be processed shortly.");
    } catch (error) {
      console.log("Error uploading file. Please try again.");
    }
  }

  function validateFileInput(fileList: FileList) {
    if (!fileList[0]) return false;
    const file = fileList[0];
    const maxSizeInBytes = 6250000; // 50 Mbit

    if (file.size > maxSizeInBytes) {
      return "File size cannot exceed 50Mb.";
    }

    return true;
  }

  const isSubmitDisabled =
    uploadMutation.isLoading || isSubmitting || !!errors.file;

  return (
    <div>
      <FormProvider {...useFormProps}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="file-upload-input">
            <input
              type="file"
              id="file-upload-input"
              {...register("file", {
                required: true,
                validate: validateFileInput,
              })}
            />
            {file instanceof FileList && file.length ? (
              <>
                <p>{file[0].name}</p>
                <p>Choose a different file</p>
              </>
            ) : (
              <>
                <p>Drag and drop files</p>
                <p>Or browse files</p>
              </>
            )}
          </label>
          {errors.file && <p role="alert">{errors.file.message}</p>}
          <button type="submit" disabled={isSubmitDisabled}>
            {uploadMutation.isLoading ? "Uploading..." : "Start processing"}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};
