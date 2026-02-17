I need to build a website for PDF automation as per the below.
•	A web front end where the user can give the path to a PDF file based on the input NAS folder.
•	The website will have a 'submit' button that will execute a Python exe in the background that will read the PDF file and place it at the NAS folder. 
•	The path for the NAS folder will also be taken from the web UI.
•	input_PDF folder houses the PDFs
•	output_extract folder is where the extract from each PDf needs to go. Each PDf content should be extracted as a txt file with the filename same as the PDF file name.

Python processing:
•	write a seprate Python code that takes the PDFs from the input_PDF folder and writes the txt extracts to the output_extract folder.
•	Place the complete python code at the folder 'pdf_processin_code'.
•	Convert the Python code  to an exe and place the exe at the folder 'pdf_processin_exe' folder. 


Best fit architecture:
•	React: quick to build a form-based UI (NAS input path, PDF path, submit, status).
•	TypeScript: reduces bugs around validation (paths, job IDs, status responses).
•	Node.js + Express: perfect as a thin API layer to:
o	accept the request from UI,
o	validate inputs,
o	kick off the Python exe (child_process),
o	return a job ID,
o	let the UI poll for status/logs.


What the architecture looks like:
Browser (React UI)
•	Fields: NAS Input Folder, PDF File Path, NAS Output Folder
•	Submit → POST to backend: /api/jobs
•	Show progress by polling: /api/jobs/{id}
Backend (Node.js + Express)
•	Validates and normalizes the paths
•	Creates a job record (in memory or DB)
•	Runs: yourPdfTool.exe --pdf "<path>" --out "<nasOut>" ...
•	Captures stdout/stderr for logs
•	Updates job status: queued → running → success/fail
Python exe
•	Does the PDF work
•	Writes output to NAS

