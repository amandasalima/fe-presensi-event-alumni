import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
	useCreateEvent,
	useEventCategories,
	type EventPayload,
} from "@/hooks/admin/useEvents";

const initialForm: EventPayload = {
	category_id: 0,
	event_title: "",
	description: "",
	location: "",
	event_date: "",
	start_time: "",
	end_time: "",
};

type EventFormElement =
	| HTMLInputElement
	| HTMLTextAreaElement
	| HTMLSelectElement;

export function useCreateEventForm(onSuccess: () => void) {
	const createEvent = useCreateEvent();
	const categoriesQuery = useEventCategories();
	const [form, setForm] = useState<EventPayload>(initialForm);

	const categories = categoriesQuery.data ?? [];
	const selectedCategoryId = form.category_id || categories[0]?.id || 0;

	const resetForm = () => {
		setForm({
			...initialForm,
			category_id: categories[0]?.id ?? 0,
		});
	};

	const handleChange = (e: ChangeEvent<EventFormElement>) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: name === "category_id" ? Number(value) : value,
		}));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!selectedCategoryId) {
			return;
		}

		createEvent.mutate(
			{
				...form,
				category_id: selectedCategoryId,
			},
			{
				onSuccess: () => {
					resetForm();
					onSuccess();
				},
			},
		);
	};

	return {
		form,
		categories,
		selectedCategoryId,
		createEvent,
		handleChange,
		handleSubmit,
		isCategoryLoading: categoriesQuery.isLoading,
		isCategoryError: categoriesQuery.isError,
	};
}
