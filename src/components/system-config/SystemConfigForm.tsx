"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, TimerReset } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  getAdminConfig,
  updateAdminConfig,
  type FeatureFlags,
  type SystemConfig,
  type UpdateSystemConfigInput,
} from "@/lib/api/system-config.api";
import {
  TimingConfigSection,
  minutesToSeconds,
  skillTimingConfigs,
  type TimingField,
} from "@/components/system-config/TimingConfigSection";
import {
  FeatureFlagSection,
  defaultFeatureFlags,
  featureFlagItems,
} from "@/components/system-config/FeatureFlagsSection";
import { PublicConfigPreview } from "@/components/system-config/PublicConfigPreview";

function normalizeConfig(config: SystemConfig): SystemConfig {
  return {
    ...config,
    featureFlags: {
      ...defaultFeatureFlags,
      ...(config.featureFlags || {}),
    },
  };
}

export function SystemConfigForm() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [draft, setDraft] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await getAdminConfig();
      const normalized = normalizeConfig(data);

      setConfig(normalized);
      setDraft(normalized);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasChanges = useMemo(() => {
    if (!config || !draft) return false;
    return JSON.stringify(config) !== JSON.stringify(draft);
  }, [config, draft]);

  const updateTimingField = (field: TimingField, minutes: number) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: minutesToSeconds(minutes),
      };
    });
  };

  const updateFeatureFlag = (key: keyof FeatureFlags, value: boolean) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        featureFlags: {
          ...current.featureFlags,
          [key]: value,
        },
      };
    });
  };

  const validate = () => {
    if (!draft) return "Không có dữ liệu cấu hình.";

    for (const item of skillTimingConfigs) {
      const min = draft[item.minField];
      const max = draft[item.maxField];
      const defaultValue = draft[item.defaultField];

      if (min <= 0 || max <= 0 || defaultValue <= 0) {
        return `${item.title}: thời gian phải lớn hơn 0 phút.`;
      }

      if (min > defaultValue || defaultValue > max) {
        return `${item.title}: thời gian mặc định phải nằm trong khoảng tối thiểu và tối đa.`;
      }
    }

    return "";
  };

  const buildPayload = (): UpdateSystemConfigInput => {
    if (!draft || !config) return {};

    const payload: UpdateSystemConfigInput = {};

    skillTimingConfigs.forEach((item) => {
      if (draft[item.defaultField] !== config[item.defaultField]) {
        payload[item.defaultField] = draft[item.defaultField];
      }

      if (draft[item.minField] !== config[item.minField]) {
        payload[item.minField] = draft[item.minField];
      }

      if (draft[item.maxField] !== config[item.maxField]) {
        payload[item.maxField] = draft[item.maxField];
      }
    });

    const changedFlags: Partial<FeatureFlags> = {};

    featureFlagItems.forEach((item) => {
      if (draft.featureFlags[item.key] !== config.featureFlags[item.key]) {
        changedFlags[item.key] = draft.featureFlags[item.key];
      }
    });

    if (Object.keys(changedFlags).length) {
      payload.featureFlags = changedFlags;
    }

    return payload;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      setSuccessMessage("");
      return;
    }

    const payload = buildPayload();

    if (!Object.keys(payload).length) {
      setSuccessMessage("Không có thay đổi cần lưu.");
      setError("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await updateAdminConfig(payload);
      const normalized = normalizeConfig(updated);

      setConfig(normalized);
      setDraft(normalized);
      setSuccessMessage("Đã cập nhật tham số hệ thống thành công.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(config);
    setError("");
    setSuccessMessage("");
  };

  if (loading) {
    return <LoadingState label="Đang tải cài đặt tham số..." />;
  }

  if (error && !draft) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!draft) {
    return (
      <EmptyState
        title="Không có dữ liệu cấu hình"
        description="Không thể tải cài đặt hệ thống từ backend."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      {successMessage ? (
        <div className="rounded-2xl border border-line bg-primarySoft p-4 text-sm font-semibold text-moss">
          {successMessage}
        </div>
      ) : null}

      <Card className="rounded-[24px] border border-line bg-surface">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
              Control panel
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Trạng thái chỉnh sửa
            </h2>
            <p className="mt-1 text-sm text-neutralText">
              {hasChanges
                ? "Bạn có thay đổi chưa lưu. Hãy lưu hoặc hoàn tác trước khi rời trang."
                : "Cấu hình hiện tại đã đồng bộ với backend."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={loadData}
              disabled={saving}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              disabled={saving || !hasChanges}
            >
              <TimerReset className="h-4 w-4" />
              Hoàn tác
            </Button>

            <Button type="submit" disabled={saving || !hasChanges}>
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PublicConfigPreview config={draft} />

      <TimingConfigSection draft={draft} onChange={updateTimingField} />

      <FeatureFlagSection
        flags={draft.featureFlags}
        onChange={updateFeatureFlag}
      />
    </form>
  );
}
