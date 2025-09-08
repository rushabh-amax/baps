// grid_overrides.js

frappe.provide("frappe.ui.form");

// Override validate_columns_width
frappe.ui.form.GridRow.prototype.validate_columns_width = function () {
    let total_column_width = 0.0;

    this.selected_columns_for_grid.forEach((row) => {
        if (row.columns && row.columns > 0) {
            total_column_width += cint(row.columns);
        }
    });

    // 🔴 Change error popup logic here
    if (total_column_width && total_column_width > 40) {
        frappe.throw(__("The total column width cannot be more than 40."));
    }
};

// Override make_column
frappe.ui.form.GridRow.prototype.make_column = function (df, colsize, txt, ci) {
    let me = this;
    let add_class =
        ["Text", "Small Text"].indexOf(df.fieldtype) !== -1
            ? " grid-overflow-no-ellipsis"
            : "";
    add_class +=
        ["Int", "Currency", "Float", "Percent"].indexOf(df.fieldtype) !== -1
            ? " text-right"
            : "";
    add_class += ["Check"].indexOf(df.fieldtype) !== -1 ? " text-center" : "";

    // Example: fixed 3-width col
    const width = 3;
    const colClass = `col-xs-${width}`;

    const $col = $(`
        <div class="col grid-static-col ${colClass} ${add_class}"
            data-fieldname="${df.fieldname}"
            data-fieldtype="${df.fieldtype}"
            style="flex: 0 0 ${width}%; ">
        </div>
    `)
        .data("df", df)
        .appendTo(this.row);

    $col.field_area = $('<div class="field-area"></div>').appendTo($col).toggle(false);
    $col.static_area = $('<div class="static-area ellipsis"></div>').appendTo($col).html(txt);

    if (!this.doc) {
        $col.attr("title", __(df.label, null, df.parent));
    }
    df.fieldname && $col.static_area.toggleClass("reqd", Boolean(df.reqd));

    $col.on("click", function () {
        if (frappe.ui.form.editable_row !== me) {
            me.toggle_editable_row();
        }
    });

    $col.df = df;
    $col.column_index = ci;
    this.columns[df.fieldname] = $col;
    this.columns_list.push($col);

    return $col;
};

// Override Grid.setup_visible_columns
frappe.ui.form.Grid.prototype.setup_visible_columns = function () {
    if (this.visible_columns && this.visible_columns.length > 0) return;

    this.user_defined_columns = [];
    this.setup_user_defined_columns();

    var total_colsize = 0;
    var fields =
        this.user_defined_columns && this.user_defined_columns.length > 0
            ? this.user_defined_columns
            : this.editable_fields || this.docfields;

    this.visible_columns = [];

    for (var ci in fields) {
        var _df = fields[ci];
        var df =
            this.user_defined_columns && this.user_defined_columns.length > 0
                ? _df
                : this.fields_map[_df.fieldname];

        if (
            df &&
            !df.hidden &&
            (this.editable_fields || df.in_list_view) &&
            ((this.frm && this.frm.get_perm(df.permlevel, "read")) || !this.frm) &&
            !frappe.model.layout_fields.includes(df.fieldtype)
        ) {
            if (df.columns) {
                df.colsize = df.columns;
            } else {
                this.update_default_colsize(df);
            }

            this.visible_columns.push([df, df.colsize]);
            total_colsize += df.colsize;
        }
    }

    // Example: allow up to 40 colsize
    var passes = 0;
    while (total_colsize < 40 && passes < 16) {
        let increased = false;
        for (var i in this.visible_columns) {
            var df = this.visible_columns[i][0];
            var colsize = this.visible_columns[i][1];

            if (colsize < 10 && frappe.model.is_non_std_field(df.fieldname)) {
                if (
                    passes < 3 &&
                    ["Int", "Currency", "Float", "Check", "Percent"].indexOf(df.fieldtype) !== -1
                ) {
                    continue;
                }
                this.visible_columns[i][1] += 1;
                total_colsize++;
                increased = true;
            }
        }
        if (!increased) break;
        passes++;
    }
};
