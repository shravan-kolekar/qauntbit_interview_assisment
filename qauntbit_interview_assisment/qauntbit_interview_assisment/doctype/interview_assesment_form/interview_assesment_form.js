// Copyright (c) 2026, Quantbit Tchnologe PVT LTD and contributors
// For license information, please see license.txt


frappe.ui.form.on("Interview Assesment Form", {

    // =====================================================
    // REFRESH
    // =====================================================

    refresh: function(frm) {

        if (!frm.is_new()) {

            calculate_average_rating(frm);
            calculate_weighted_percentage(frm);

        }


        // Set today's date only if empty

        if (!frm.doc.date_of_interview) {

            frm.set_value(
                "date_of_interview",
                frappe.datetime.nowdate()
            );

        }

    },


    // =====================================================
    // INTERVIEW ROUND
    // =====================================================

    interview_round: function(frm) {

        if (frm.doc.interview_round === "1") {

            frm.set_value(
                "interview_type",
                "Hr Round"
            );

        }

        else if (frm.doc.interview_round === "2") {

            frm.set_value(
                "interview_type",
                "Manager Round"
            );

        }

        else if (frm.doc.interview_round === "3") {

            frm.set_value(
                "interview_type",
                "Supervisor Round"
            );

        }

        else {

            frm.set_value(
                "interview_type",
                ""
            );

        }

    },


    // =====================================================
    // POSTING APPLIED FOR
    // =====================================================

    posting_applyed_for: function(frm) {

        console.log(
            "Posting Applied For:",
            frm.doc.posting_applyed_for
        );


        // =================================================
        // CLEAR OLD SKILLS
        // =================================================

        frm.clear_table(
            "interview_assesmant_rating_table"
        );


        frm.refresh_field(
            "interview_assesmant_rating_table"
        );


        // =================================================
        // RESET CALCULATIONS
        // =================================================

        frm.set_value(
            "average_score_auto",
            0
        );

        frm.set_value(
            "overall_percentage",
            0
        );


        // =================================================
        // IF NO JOB OPENING
        // =================================================

        if (!frm.doc.posting_applyed_for) {

            return;

        }


        // =================================================
        // GET SKILLS FROM SKILLS FORM
        // =================================================

        frappe.call({

            method: "frappe.client.get_list",

            args: {

                doctype: "Skills Form",

                filters: {

                    job_opening:
                        frm.doc.posting_applyed_for,

                    active: 1

                },

                fields: [

                    "name",
                    "skill_name",
                    "job_opening",
                    "weitage",
                    "active"

                ],

                limit_page_length: 100

            },


            callback: function(r) {

                console.log(
                    "Skills Response:",
                    r.message
                );


                // =================================================
                // NO SKILLS FOUND
                // =================================================

                if (
                    !r.message ||
                    r.message.length === 0
                ) {

                    frappe.msgprint(
                        "No Skills found for this Job Opening."
                    );

                    return;

                }


                // =================================================
                // LOAD SKILLS INTO CHILD TABLE
                // =================================================

                r.message.forEach(function(skill) {

                    let row = frm.add_child(
                        "interview_assesmant_rating_table"
                    );


                    // ---------------------------------------------
                    // Skill
                    // ---------------------------------------------

                    row.skills_name =
                        skill.name;


                    // ---------------------------------------------
                    // Job Opening
                    // ---------------------------------------------

                    row.posting_applyed =
                        skill.job_opening;


                    // ---------------------------------------------
                    // Default Rating
                    // ---------------------------------------------

                    row.rating = 0;


                    // ---------------------------------------------
                    // Skill Weightage
                    // ---------------------------------------------

                    row.weightage =
                        flt(skill.weitage);


                    // ---------------------------------------------
                    // Initial Weighted Score
                    // ---------------------------------------------

                    row.weighted_score = 0;

                });


                // =================================================
                // REFRESH CHILD TABLE
                // =================================================

                frm.refresh_field(
                    "interview_assesmant_rating_table"
                );


                frappe.msgprint(
                    r.message.length +
                    " skill(s) loaded successfully."
                );


                // =================================================
                // CALCULATE
                // =================================================

                calculate_average_rating(frm);

                calculate_weighted_percentage(frm);

            },


            error: function(err) {

                console.error(
                    "Error while loading Skills:",
                    err
                );


                frappe.msgprint(
                    "Error while loading Skills. Check browser console."
                );

            }

        });

    },


    // =====================================================
    // VALIDATE
    // =====================================================

    validate: function(frm) {

        calculate_average_rating(frm);

        calculate_weighted_percentage(frm);

    }

});



// =========================================================
// CHILD TABLE EVENTS
// =========================================================

frappe.ui.form.on(
    "Interview Assesmant Rating Table",
    {

        // =================================================
        // RATING CHANGE
        // =================================================

        rating: function(frm, cdt, cdn) {

            let row =
                locals[cdt][cdn];


            console.log(
                "Skill:",
                row.skills_name
            );

            console.log(
                "Rating Value:",
                row.rating
            );


            // ---------------------------------------------
            // Validate Rating
            // ---------------------------------------------

            let rating =
                flt(row.rating);


            if (rating < 0) {

                frappe.model.set_value(
                    cdt,
                    cdn,
                    "rating",
                    0
                );

                rating = 0;

            }


            if (rating > 5) {

                frappe.msgprint(
                    "Rating cannot be greater than 5."
                );

                frappe.model.set_value(
                    cdt,
                    cdn,
                    "rating",
                    5
                );

            }


            // ---------------------------------------------
            // Calculate Row Weighted Score
            // ---------------------------------------------

            calculate_row_weighted_score(
                frm,
                cdt,
                cdn
            );


            // ---------------------------------------------
            // Calculate Overall
            // ---------------------------------------------

            calculate_average_rating(frm);

            calculate_weighted_percentage(frm);

        },


        // =================================================
        // WEIGHTAGE CHANGE
        // =================================================

        weightage: function(frm, cdt, cdn) {

            calculate_row_weighted_score(
                frm,
                cdt,
                cdn
            );


            calculate_weighted_percentage(frm);

        },


        // =================================================
        // SKILL CHANGE
        // =================================================

        skills_name: function(frm, cdt, cdn) {

            let row =
                locals[cdt][cdn];


            if (!row.skills_name) {

                frappe.model.set_value(
                    cdt,
                    cdn,
                    "weightage",
                    0
                );

                frappe.model.set_value(
                    cdt,
                    cdn,
                    "weighted_score",
                    0
                );

                calculate_weighted_percentage(frm);

                return;

            }


            // =================================================
            // GET WEIGHTAGE FROM SKILLS FORM
            // =================================================

            frappe.db.get_value(
                "Skills Form",
                row.skills_name,
                "weitage"
            ).then(function(r) {

                if (
                    r &&
                    r.message
                ) {

                    let weightage =
                        flt(r.message.weitage);


                    frappe.model.set_value(
                        cdt,
                        cdn,
                        "weightage",
                        weightage
                    );


                    calculate_row_weighted_score(
                        frm,
                        cdt,
                        cdn
                    );


                    calculate_weighted_percentage(frm);

                }

            });

        }

    }
);



// =========================================================
// CALCULATE ROW WEIGHTED SCORE
// =========================================================

function calculate_row_weighted_score(
    frm,
    cdt,
    cdn
) {

    let row =
        locals[cdt][cdn];


    let rating =
        flt(row.rating);


    let weightage =
        flt(row.weightage);


    // =====================================================
    // RATING OUT OF 5
    // =====================================================

    let weighted_score = 0;


    if (
        rating > 0 &&
        weightage > 0
    ) {

        weighted_score =
            (rating / 5) *
            weightage;

    }


    // =====================================================
    // ROUND TO 2 DECIMAL
    // =====================================================

    weighted_score =
        Math.round(
            weighted_score * 100
        ) / 100;


    // =====================================================
    // SET WEIGHTED SCORE
    // =====================================================

    frappe.model.set_value(
        cdt,
        cdn,
        "weighted_score",
        weighted_score
    );


    console.log(
        "--------------------------------------"
    );

    console.log(
        "Skill:",
        row.skills_name
    );

    console.log(
        "Rating:",
        rating
    );

    console.log(
        "Weightage:",
        weightage
    );

    console.log(
        "Weighted Score:",
        weighted_score
    );

    console.log(
        "--------------------------------------"
    );

}



// =========================================================
// AVERAGE RATING CALCULATION
// =========================================================

function calculate_average_rating(frm) {

    let rows =
        frm.doc.interview_assesmant_rating_table || [];


    // =====================================================
    // NO SKILLS
    // =====================================================

    if (rows.length === 0) {

        frm.set_value(
            "average_score_auto",
            0
        );

        return;

    }


    // =====================================================
    // VARIABLES
    // =====================================================

    let total_rating = 0;

    let rating_count = 0;


    // =====================================================
    // LOOP THROUGH ALL SKILLS
    // =====================================================

    rows.forEach(function(row) {

        let rating =
            parseFloat(row.rating);


        // =================================================
        // ONLY COUNT VALID RATINGS
        // =================================================

        if (
            !isNaN(rating) &&
            rating > 0
        ) {

            total_rating += rating;

            rating_count++;

        }

    });


    // =====================================================
    // CALCULATE AVERAGE
    // =====================================================

    let average_rating = 0;


    if (rating_count > 0) {

        average_rating =
            total_rating /
            rating_count;

    }


    // =====================================================
    // ROUND TO 2 DECIMAL
    // =====================================================

    average_rating =
        Math.round(
            average_rating * 100
        ) / 100;


    // =====================================================
    // MAXIMUM RATING = 5
    // =====================================================

    if (average_rating > 5) {

        average_rating = 5;

    }


    // =====================================================
    // SET AVERAGE RATING
    // =====================================================

    frm.set_value(
        "average_score_auto",
        average_rating
    );


    console.log(
        "Total Rating:",
        total_rating
    );

    console.log(
        "Rating Count:",
        rating_count
    );

    console.log(
        "Average Rating:",
        average_rating
    );

}



// =========================================================
// WEIGHTED OVERALL PERCENTAGE
// =========================================================

function calculate_weighted_percentage(frm) {

    let rows =
        frm.doc.interview_assesmant_rating_table || [];


    // =====================================================
    // NO ROWS
    // =====================================================

    if (rows.length === 0) {

        frm.set_value(
            "overall_percentage",
            0
        );

        return;

    }


    // =====================================================
    // VARIABLES
    // =====================================================

    let total_weighted_score = 0;

    let total_weightage = 0;


    // =====================================================
    // LOOP THROUGH ALL SKILLS
    // =====================================================

    rows.forEach(function(row) {

        let rating =
            flt(row.rating);


        let weightage =
            flt(row.weightage);


        // =================================================
        // VALID DATA
        // =================================================

        if (
            rating >= 0 &&
            weightage > 0
        ) {

            // ---------------------------------------------
            // Rating is out of 5
            // ---------------------------------------------

            let weighted_score =
                (rating / 5) *
                weightage;


            // ---------------------------------------------
            // Round row score
            // ---------------------------------------------

            weighted_score =
                Math.round(
                    weighted_score * 100
                ) / 100;


            // ---------------------------------------------
            // Add total
            // ---------------------------------------------

            total_weighted_score +=
                weighted_score;


            total_weightage +=
                weightage;


            console.log(
                "Skill:",
                row.skills_name
            );

            console.log(
                "Rating:",
                rating
            );

            console.log(
                "Weightage:",
                weightage
            );

            console.log(
                "Weighted Score:",
                weighted_score
            );

        }

    });


    // =====================================================
    // FINAL OVERALL PERCENTAGE
    // =====================================================

    let overall_percentage = 0;


    /*
        If total weightage = 100%

        Example:

        Rating 4, Weightage 50
        = 4/5 × 50
        = 40

        Rating 5, Weightage 20
        = 5/5 × 20
        = 20

        Final = 60%
    */


    if (total_weightage > 0) {

        // ---------------------------------------------
        // Normal case: total weightage = 100
        // ---------------------------------------------

        if (total_weightage === 100) {

            overall_percentage =
                total_weighted_score;

        }

        else {

            /*
                If weightage is not 100,
                normalize it to 100.
            */

            overall_percentage =
                (
                    total_weighted_score /
                    total_weightage
                ) * 100;

        }

    }


    // =====================================================
    // ROUND TO 2 DECIMAL
    // =====================================================

    overall_percentage =
        Math.round(
            overall_percentage * 100
        ) / 100;


    // =====================================================
    // MAXIMUM 100%
    // =====================================================

    if (overall_percentage > 100) {

        overall_percentage = 100;

    }


    // =====================================================
    // SET OVERALL PERCENTAGE
    // =====================================================

    frm.set_value(
        "overall_percentage",
        overall_percentage
    );


    // =====================================================
    // REFRESH FIELDS
    // =====================================================

    frm.refresh_field(
        "interview_assesmant_rating_table"
    );


    frm.refresh_field(
        "overall_percentage"
    );


    // =====================================================
    // CONSOLE
    // =====================================================

    console.log(
        "======================================"
    );

    console.log(
        "Total Weightage:",
        total_weightage
    );

    console.log(
        "Total Weighted Score:",
        total_weighted_score
    );

    console.log(
        "Overall Percentage:",
        overall_percentage
    );

    console.log(
        "======================================"
    );

}