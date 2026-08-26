import frappe
from frappe import _


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{
			"label": _("Sr No"),
			"fieldname": "column_1",
			"fieldtype": "Data",
			"width": 60,
		},
		{
			"label": _("ID Name"),
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "Interview Assesment Form",
			"width": 200,
		},
		{
			"label": _("Applicant"),
			"fieldname": "applicent",
			"fieldtype": "Link",
			"options": "Job Applicant",
			"width": 200,
		},
		{
			"label": _("Applicant Name"),
			"fieldname": "applicent_name",
			"fieldtype": "Data",
			"width": 200,
		},
		{
			"label": _("Posting Applied For"),
			"fieldname": "posting_applyed_for",
			"fieldtype": "Data",
			"width": 200,
		},
		{
			"label": _("Interviewer Name"),
			"fieldname": "interviwer_name",
			"fieldtype": "Link",
			"options": "Employee",
			"width": 200,
		},
		{
			"label": _("Date of Interview"),
			"fieldname": "date_of_interview",
			"fieldtype": "Date",
			"width": 150,
		},
		{
			"label": _("Recommendation"),
			"fieldname": "recommendation",
			"fieldtype": "Data",
			"width": 200,
		},
		{
			"label": _("Interview Round"),
			"fieldname": "interview_round",
			"fieldtype": "Link",
			"options": "Interview Round Types",
			"width": 200,
		},
		{
			"label": _("Interview Type Weightage"),
			"fieldname": "interview_type_weightage",
			"fieldtype": "Percent",
			"width": 180,
		},
		{
			"label": _("Skills Name"),
			"fieldname": "skills_name",
			"fieldtype": "Data",
			"width": 200,
		},
		{
			"label": _("Weightage"),
			"fieldname": "weightage",
			"fieldtype": "Percent",
			"width": 120,
		},
		{
			"label": _("Rating"),
			"fieldname": "rating",
			"fieldtype": "Float",
			"width": 100,
		},
		{
			"label": _("Weighted Score"),
			"fieldname": "weighted_score",
			"fieldtype": "Data",
			"width": 150,
		},
		{
			"label": _("Overall Rating"),
			"fieldname": "overall_rating",
			"fieldtype": "HTML",
			"width": 150,
		},
	]


def get_data(filters=None):

	filters = filters or {}
	data = []

	parent_filters = {}

	# if filters.get("applicent"):
	# 	parent_filters["applicent"] = filters.get("applicent")

	if filters.get("applicent_name"):
		parent_filters["applicent_name"] = [
			"like",
			f"%{filters.get('applicent_name')}%"
		]

	if filters.get("post_applied_for"):
		parent_filters["posting_applyed_for"] = filters.get(
			"post_applied_for"
		)

	if filters.get("interviwer_name"):
		parent_filters["interviwer_name"] = filters.get(
			"interviwer_name"
		)

	if filters.get("date_of_interview"):
		parent_filters["date_of_interview"] = filters.get(
			"date_of_interview"
		)

	if filters.get("recommendation"):
		parent_filters["recommendation"] = filters.get(
			"recommendation"
		)

	parent_data = frappe.get_all(
		"Interview Assesment Form",
		filters=parent_filters,
		fields=[
			"name",
			"applicent",
			"applicent_name",
			"posting_applyed_for",
			"interviwer_name",
			"date_of_interview",
			"recommendation",
			"creation",
		],
		order_by="applicent asc, creation asc",
	)

	applicant_data = {}

	for parent in parent_data:

		if parent.applicent not in applicant_data:
			applicant_data[parent.applicent] = []

		applicant_data[parent.applicent].append(parent)

	sr_no = 1

	for applicant, forms in applicant_data.items():

		total_weighted_rating = 0
		total_weight_for_rating = 0

		form_has_data = False
		form_index_count = 0

		for parent in forms:

			child_filters = {
				"parent": parent.name,
				"parenttype": "Interview Assesment Form",
			}

			if filters.get("interview_round"):
				child_filters["interview_round"] = filters.get(
					"interview_round"
				)

			child_data = frappe.get_all(
				"Interview Assesmant Rating Table",
				filters=child_filters,
				fields=[
					"interview_round",
					"interview_type_weightage",
					"skills_name",
					"weightage",
					"rating",
					"weighted_score",
				],
				order_by="idx asc",
			)

			if filters.get("interview_round") and not child_data:
				continue

			if child_data:

				first_child_row = True

				for child in child_data:

					row = {}

					if first_child_row:

						if not form_has_data:
							row["column_1"] = sr_no

						row["name"] = parent.name
						row["applicent"] = parent.applicent
						row["applicent_name"] = parent.applicent_name
						row["posting_applyed_for"] = parent.posting_applyed_for
						row["interviwer_name"] = parent.interviwer_name
						row["date_of_interview"] = parent.date_of_interview
						row["recommendation"] = parent.recommendation or ""

						first_child_row = False
						form_has_data = True

					row["interview_round"] = child.interview_round
					row["interview_type_weightage"] = child.interview_type_weightage
					row["skills_name"] = child.skills_name
					row["weightage"] = child.weightage
					row["rating"] = child.rating
					row["weighted_score"] = child.weighted_score

					data.append(row)

					skill_weightage = frappe.utils.flt(
						child.weightage
					)

					round_weightage = frappe.utils.flt(
						child.interview_type_weightage
					)

					rating = frappe.utils.flt(
						child.rating
					)

					actual_weightage = (
						skill_weightage * round_weightage
					) / 100

					total_weighted_rating += (
						rating * actual_weightage
					)

					total_weight_for_rating += (
						actual_weightage
					)

				form_index_count += 1

			else:

				if filters.get("interview_round"):
					continue

				row = {}

				if not form_has_data:
					row["column_1"] = sr_no

				row["name"] = parent.name
				row["applicent"] = parent.applicent
				row["applicent_name"] = parent.applicent_name
				row["posting_applyed_for"] = parent.posting_applyed_for
				row["interviwer_name"] = parent.interviwer_name
				row["date_of_interview"] = parent.date_of_interview
				row["recommendation"] = parent.recommendation or ""

				data.append(row)

				form_has_data = True
				form_index_count += 1

		if not form_has_data:
			continue

		overall_rating = 0

		if total_weight_for_rating:
			overall_rating = (
				total_weighted_rating /
				total_weight_for_rating
			)

		data.append({
			"weighted_score": "<b>Overall Rating</b>",
			"overall_rating": (
				f"<b>{frappe.utils.flt(overall_rating, 2)} / 5</b>"
			),
		})

		data.append({})

		sr_no += 1

	return data


def execute_snapshot_report(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data