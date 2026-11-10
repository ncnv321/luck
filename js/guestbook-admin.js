const KEY_STORE = "luck-guestbook-admin-key";
const keyInput = document.getElementById("adminKey");
const list = document.getElementById("list");
const statusEl = document.getElementById("status");
const filterInput = document.getElementById("filter");
let notes = [];

try {
  keyInput.value = sessionStorage.getItem(KEY_STORE) || "";
} catch {}

function setStatus(text) {
  statusEl.textContent = text;
}

function adminKey() {
  return keyInput.value.trim();
}

document.getElementById("useKey").addEventListener("click", () => {
  try {
    sessionStorage.setItem(KEY_STORE, adminKey());
  } catch {}
  setStatus(adminKey() ? "Key set for this tab." : "Key cleared.");
});

async function request(method, id, body) {
  const response = await fetch(`/api/guestbook?id=${encodeURIComponent(id)}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Error ${response.status}`);
  return result;
}

function render() {
  const query = filterInput.value.trim().toLowerCase();
  list.innerHTML = "";

  [...notes]
    .reverse()
    .filter(
      (n) =>
        !query ||
        `${n.text} ${n.name || ""} ${n.id}`.toLowerCase().includes(query),
    )
    .forEach((note) => {
      const row = document.createElement("div");
      row.className = "note-row";

      const meta = document.createElement("div");
      meta.className = "meta";
      const imported = note.id.startsWith("smartgb-");
      [
        note.id,
        new Date(note.date).toLocaleString(),
        imported ? "imported from SmartGB" : `author ${note.author}`,
      ].forEach((text) => {
        const span = document.createElement("span");
        span.textContent = text;
        meta.appendChild(span);
      });

      const text = document.createElement("textarea");
      text.value = note.text;

      row.append(meta, text);

      let name = null;
      if (imported) {
        name = document.createElement("input");
        name.className = "name";
        name.value = note.name || "";
        name.placeholder = "name";
        row.appendChild(name);
      }

      const actions = document.createElement("div");
      actions.className = "actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger";
      remove.textContent = "Remove";
      const save = document.createElement("button");
      save.type = "button";
      save.className = "primary";
      save.textContent = "Save";
      actions.append(remove, save);
      row.appendChild(actions);

      save.addEventListener("click", async () => {
        try {
          const body = { text: text.value };
          if (name) body.name = name.value;
          const result = await request("PATCH", note.id, body);
          Object.assign(note, result.note);
          row.classList.add("is-saved");
          setStatus(`Saved ${note.id}.`);
        } catch (error) {
          setStatus(`Couldn't save: ${error.message}`);
        }
      });

      remove.addEventListener("click", async () => {
        if (!confirm("Remove this note from the guestbook?")) return;
        try {
          await request("DELETE", note.id);
          notes = notes.filter((n) => n.id !== note.id);
          render();
          setStatus(`Removed ${note.id}.`);
        } catch (error) {
          setStatus(`Couldn't remove: ${error.message}`);
        }
      });

      list.appendChild(row);
    });
}

filterInput.addEventListener("input", render);

fetch("/api/guestbook")
  .then((response) => response.json())
  .then((data) => {
    notes = data.notes || [];
    render();
    setStatus(
      data.canPost
        ? `${notes.length} notes.`
        : `${notes.length} notes. The database isn't connected yet, so changes can't be saved.`,
    );
  })
  .catch(() =>
    setStatus("Couldn't load notes (this page only works on the live site)."),
  );
