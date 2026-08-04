"use client";

import { useState } from "react";
import {
	useAdminProfile,
	useSystemStatus,
	useTestWAConnection,
	useUpdateAdminProfile,
	useUpdatePassword,
	useUpdateWAConfig,
	useUploadAdminAvatar,
	useDeleteAdminAvatar,
	useWAConfig,
	type WATestResponse,
} from "@/hooks/admin/useSetting";
import { getApiErrorMessage } from "@/lib/api";
import {
	DEFAULT_FONNTE_API_URL,
	FONNTE_PROVIDER,
	isValidSenderNumber,
} from "../_utils/waConfig";

export function useSettingsPage() {
	const [name, setName] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [apiToken, setApiToken] = useState<string | null>(null);
	const [senderNumber, setSenderNumber] = useState<string | null>(null);
	const [isEditingWA, setIsEditingWA] = useState(false);
	const [waFormError, setWAFormError] = useState("");
	const [showToken, setShowToken] = useState(false);
	const [testResult, setTestResult] = useState<WATestResponse | null>(null);
	const [testError, setTestError] = useState("");
	const { data: profile, isLoading: loadingProfile } = useAdminProfile();
	const { data: status, isLoading: loadingStatus } = useSystemStatus();
	const {
		data: waConfig,
		isLoading: loadingWA,
		isError: isWAConfigError,
		error: waConfigError,
	} = useWAConfig();
	const updateProfile = useUpdateAdminProfile();
	const updatePassword = useUpdatePassword();
	const saveWAConfig = useUpdateWAConfig();
	const testWAConnection = useTestWAConnection();
	const uploadAvatar = useUploadAdminAvatar();
	const deleteAvatar = useDeleteAdminAvatar();

	const readOnlyConnected =
		Boolean(waConfig?.is_configured && waConfig?.connected) && !isEditingWA;
	const canEditWA = waConfig?.can_edit ?? true;
	const isWAConfigured = Boolean(waConfig?.is_configured);
	const editingWA = isEditingWA || !isWAConfigured;
	const effectiveName = name ?? profile?.name ?? "";
	const effectiveEmail = email ?? profile?.email ?? "";
	const effectiveApiUrl = DEFAULT_FONNTE_API_URL;
	const effectiveApiToken = apiToken ?? waConfig?.api_token ?? "";
	const effectiveSenderNumber = senderNumber ?? waConfig?.sender_number ?? "";
	const savedMaskedToken = waConfig?.api_token ?? "";
	const tokenChanged =
		effectiveApiToken.trim() !== "" && effectiveApiToken !== savedMaskedToken;
	const savingWA = saveWAConfig.isPending;
	const testingWA = testWAConnection.isPending;

	const handleSaveProfile = () => {
		updateProfile.mutate({ name: effectiveName, email: effectiveEmail });
	};

	const handleUpdatePassword = () => {
		setPasswordError("");

		if (!oldPassword.trim()) {
			setPasswordError("Password lama wajib diisi");
			return;
		}

		if (!newPassword.trim()) {
			setPasswordError("Password baru wajib diisi");
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError("Password baru minimal 8 karakter");
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("Password baru dan konfirmasi tidak cocok");
			return;
		}

		if (oldPassword === newPassword) {
			setPasswordError("Password baru tidak boleh sama dengan password lama");
			return;
		}

		updatePassword.mutate(
			{
				current_password: oldPassword,
				new_password: newPassword,
				new_password_confirmation: confirmPassword,
			},
			{
				onSuccess: () => {
					setOldPassword("");
					setNewPassword("");
					setConfirmPassword("");
				},
			},
		);
	};

	const buildWAConfigPayload = () => ({
		provider: FONNTE_PROVIDER,
		api_url: DEFAULT_FONNTE_API_URL,
		api_token: isWAConfigured && !tokenChanged ? "" : effectiveApiToken.trim(),
		sender_number: effectiveSenderNumber.trim(),
	});

	const validateWAForm = () => {
		if (!isWAConfigured && !effectiveApiToken.trim()) {
			return "API token wajib diisi untuk konfigurasi baru";
		}

		if (!isValidSenderNumber(effectiveSenderNumber)) {
			return "Nomor pengirim harus angka saja dan diawali 62";
		}

		return "";
	};

	const resetWAFeedback = () => {
		setWAFormError("");
		setTestError("");
		setTestResult(null);
	};

	const handleStartEditWA = () => {
		resetWAFeedback();
		setIsEditingWA(true);
		setApiToken(waConfig?.api_token || "");
		setSenderNumber(waConfig?.sender_number || "");
	};

	const handleCancelEditWA = () => {
		resetWAFeedback();
		setIsEditingWA(false);
		setApiToken(null);
		setSenderNumber(null);
	};

	const handleSaveWAConfig = () => {
		resetWAFeedback();

		const validationMessage = validateWAForm();
		if (validationMessage) {
			setWAFormError(validationMessage);
			return;
		}

		saveWAConfig.mutate(buildWAConfigPayload(), {
			onSuccess: (data) => {
				setApiToken(null);
				setSenderNumber(null);
				setIsEditingWA(!data.is_configured || !data.connected);
			},
		});
	};

	const handleTestWA = () => {
		resetWAFeedback();

		if (readOnlyConnected) {
			testWAConnection.mutate(undefined, {
				onSuccess: (data) => setTestResult(data),
				onError: (error) =>
					setTestError(
						getApiErrorMessage(error, "Koneksi gagal, periksa token Fonnte"),
					),
			});
			return;
		}

		const validationMessage = validateWAForm();
		if (validationMessage) {
			setWAFormError(validationMessage);
			return;
		}

		testWAConnection.mutate(buildWAConfigPayload(), {
			onSuccess: (data) => setTestResult(data),
			onError: (error) =>
				setTestError(
					getApiErrorMessage(error, "Koneksi gagal, periksa token Fonnte"),
				),
		});
	};

	const waTestStatus = testResult?.status;
	const isWABlocked =
		waTestStatus === "blocked" || testResult?.sender_status === "blocked";
	const isWATestSuccess =
		!isWABlocked &&
		(testResult?.success === true ||
			waTestStatus === "connected" ||
			Boolean(testResult && !waTestStatus));
	const waSuccess = saveWAConfig.isSuccess || isWATestSuccess;
	const waError = Boolean(
		waFormError || testError || saveWAConfig.isError || isWAConfigError,
	);

	return {
		canEditWA,
		confirmPassword,
		deleteAvatar,
		effectiveApiToken,
		effectiveApiUrl,
		effectiveEmail,
		effectiveName,
		effectiveSenderNumber,
		editingWA,
		handleCancelEditWA,
		handleSaveProfile,
		handleSaveWAConfig,
		handleStartEditWA,
		handleTestWA,
		handleUpdatePassword,
		isWABlocked,
		isWAConfigError,
		isWAConfigured,
		isWATestSuccess,
		loadingProfile,
		loadingStatus,
		loadingWA,
		newPassword,
		oldPassword,
		passwordError,
		profile,
		readOnlyConnected,
		saveWAConfig,
		savingWA,
		setApiToken,
		setConfirmPassword,
		setEmail,
		setName,
		setNewPassword,
		setOldPassword,
		setSenderNumber,
		setShowToken,
		setWAFormError,
		showToken,
		status,
		testError,
		testResult,
		testingWA,
		updatePassword,
		updateProfile,
		uploadAvatar,
		waConfig,
		waConfigError,
		waError,
		waFormError,
		waSuccess,
	};
}
