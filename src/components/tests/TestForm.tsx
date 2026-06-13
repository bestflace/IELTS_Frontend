"use client";

import type { ComponentProps, ReactNode } from "react";
import { Card } from "@/components/common/Card";
import { TestMetadataForm } from "@/components/tests/TestMetadataForm";

type TestMetadataFormProps = ComponentProps<typeof TestMetadataForm>;

type Props = Partial<TestMetadataFormProps> & {
  children?: ReactNode;
};

export function TestForm({ children, ...props }: Props) {
  if (props.mode) {
    return <TestMetadataForm {...(props as TestMetadataFormProps)} />;
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-2xl font-black text-slate-950">
        Thông tin đề thi
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Component này dùng để tạo hoặc chỉnh sửa metadata của đề thi.
      </p>

      {children ? <div className="mt-5">{children}</div> : null}
    </Card>
  );
}
