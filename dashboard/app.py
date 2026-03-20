from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded."})

    file = request.files["file"]
    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"success": False, "error": "Only Excel files allowed."})

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    df = pd.read_excel(filepath)

    numeric_cols = df.select_dtypes(include='number').columns.tolist()
    label_cols = df.select_dtypes(exclude='number').columns.tolist()
    if label_cols:
        label_col = label_cols[0]
    else:
        df.reset_index(inplace=True)
        label_col = "index"

    data = {
        "labels": df[label_col].astype(str).tolist(),
        "numeric_cols": numeric_cols,
        "values": {col: df[col].tolist() for col in numeric_cols}
    }
    return jsonify({"success": True, "data": data})

if __name__ == "__main__":
    app.run(debug=True)
