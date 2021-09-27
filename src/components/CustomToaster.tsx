import { AnimationStyles, mergeStyles, MessageBar, MessageBarType } from "@fluentui/react";
import { useEffect } from "react";
import toast, { resolveValue, Toaster, useToasterStore } from "react-hot-toast";

export const CustomToaster = () => {
    const { toasts } = useToasterStore();

    const TOAST_LIMIT = 3;

    useEffect(() => {
        toasts
            .filter(t => t.visible)
            .filter((_, index) => index >= TOAST_LIMIT)
            .forEach(t => toast.dismiss(t.id));
    }, [toasts]);

    return (
        <Toaster position="bottom-center" gutter={0} containerStyle={{ padding: 0, inset: 0 }} toastOptions={{
            success: {
                duration: 2000
            },
            error: {
                duration: 9999999999,
            }
        }}
        >
            {(t) => {
                const types = {
                    "error": MessageBarType.error,
                    "success": MessageBarType.success,
                    "loading": MessageBarType.blocked,
                    "blank": MessageBarType.info,
                    "custom": MessageBarType.info
                };
                return (
                    <MessageBar
                        key={t.id}
                        messageBarType={types[t.type]}
                        className={mergeStyles(t.visible ? AnimationStyles.scaleUpIn100 : AnimationStyles.scaleUpOut103)}
                        dismissButtonAriaLabel="Close"
                        onDismiss={() => {
                            toast.dismiss(t.id);
                        }}
                    >
                        {resolveValue(t.message, t)}
                    </MessageBar>
                )
            }}
        </Toaster>
    );
};