declare module "ai/react" {
  import * as React from "react";
  export function useChat(options?: { api?: string }): {
    messages: any[];
    input: string;
    handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
    handleSubmit: React.FormEventHandler<HTMLFormElement>;
    isLoading: boolean;
  };
}