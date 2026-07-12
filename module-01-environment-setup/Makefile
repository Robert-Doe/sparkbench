.PHONY: run setup clean

venv/bin/activate: requirements.txt
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt

setup: venv/bin/activate

run: setup
	@echo "Site A: http://127.0.0.1:5000"
	@echo "Site B: http://127.0.0.1:5001"
	./venv/bin/python lab_server.py

clean:
	rm -rf venv __pycache__
