// Copyright (c) 2026, Quantbit Tchnologe PVT LTD and contributors
// For license information, please see license.txt

frappe.query_reports["Interview Assisment Details Report"] = {
	filters: [
		// {
		// 	"fieldname": "applicent",
		// 	"label": __("Applicent"),
		// 	"fieldtype": "Link",
		// 	"options": "Job Applicant",
		// 	"width": "80",
		// },
		{
			"fieldname" : "applicent_name",
			"label": __("Applicent Name"),
			"fieldtype": "Data",
			"width": "80",
		},
		{
			"fieldname" : "post_applied_for",
			"label": __("Post Applied For"),
			"fieldtype": "Link",
			"options": "Job Opening",
			"width": "80",
		},
		{
			"fieldname" : "interviwer_name",
			"label": __("Interviwer Name"),
			"fieldtype": "Link",
			"options": "Employee",
			"width": "80",
		},
		{
			"fieldname" : "date_of_interview",
			"label": __("Date of Interview"),
			"fieldtype": "Date",
			"width": "80",
		},
		{
			"fieldname" : "interview_round",
			"label": __("Interview Round"),
			"fieldtype": "Link",
			"options": "Interview Round Types",
			"width": "80",
		},
		{
			"fieldname" : "recommendation",
			"label" : __("Recommendation"),
			"fieldtype": "Select",
			"options": "\nSelect\nHold\nNot suitable for the post",
			"width": "80",
		},
		// {
	    // 	"fieldname": "overall_rating",
	    // 	"label": __("Overall Rating"),
	    // 	"fieldtype": "Float",
	    // 	"width": "80"
		// },
	],
};
