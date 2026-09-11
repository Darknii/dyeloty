"use client";
/* eslint-disable @next/next/no-img-element -- project images are signed Supabase Storage URLs */

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getProjectImageUrl, isProjectImageFile, PROJECT_IMAGE_TYPES, removeProjectImage, uploadProjectImage } from "./projectImages";
import { supabase } from "./supabase";

type Project = { id: number; slot: number; title: string; description: string | null; yarn_name: string | null; yarn_brand: string | null; image_url: string; created_at: string };
type FormProject = { id: number | null; slot: number | null; image_url: string | null };
const blankProject: FormProject = { id: null, slot: null, image_url: null };

export default function AccountProjects({ userId, language }: { userId: string; language: "en" | "pl" }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormProject | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [yarnName, setYarnName] = useState("");
  const [yarnBrand, setYarnBrand] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const t = language === "pl"
    ? { title: "Moje projekty", add: "Dodaj projekt", edit: "Edytuj", remove: "Usuń", empty: "Nie dodałaś jeszcze żadnego projektu.", formTitle: "Tytuł projektu", description: "Opis (opcjonalnie)", yarnName: "Nazwa włóczki (opcjonalnie)", yarnBrand: "Marka włóczki (opcjonalnie)", image: "Zdjęcie projektu", choose: "Wybierz zdjęcie", change: "Zmień zdjęcie", save: "Zapisz projekt", cancel: "Anuluj", required: "Dodaj tytuł i zdjęcie projektu.", imageError: "Wybierz JPG, PNG lub WebP o rozmiarze do 5 MB.", error: "Nie udało się zapisać projektu.", deleteError: "Nie udało się usunąć projektu.", limit: "Możesz dodać maksymalnie 6 projektów." }
    : { title: "My projects", add: "Add project", edit: "Edit", remove: "Delete", empty: "You have not added any projects yet.", formTitle: "Project title", description: "Description (optional)", yarnName: "Yarn name (optional)", yarnBrand: "Yarn brand (optional)", image: "Project image", choose: "Choose image", change: "Change image", save: "Save project", cancel: "Cancel", required: "Add a project title and image.", imageError: "Choose a JPG, PNG, or WebP image up to 5 MB.", error: "Could not save the project.", deleteError: "Could not delete the project.", limit: "You can add up to 6 projects." };

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("id, slot, title, description, yarn_name, yarn_brand, image_url, created_at").eq("user_id", userId).order("created_at", { ascending: false }).returns<Project[]>();
    setLoading(false);
    if (error) { setMessage(t.error); return; }
    setProjects(data ?? []);
  }, [t.error, userId]);

  useEffect(() => { const timeoutId = window.setTimeout(() => { void loadProjects(); }, 0); return () => window.clearTimeout(timeoutId); }, [loadProjects]);
  useEffect(() => () => { if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function startNew() {
    if (projects.length >= 6) { setMessage(t.limit); return; }
    setEditing(blankProject); setTitle(""); setDescription(""); setYarnName(""); setYarnBrand(""); setImageFile(null); setPreviewUrl(null); setMessage("");
  }

  async function startEdit(project: Project) {
    setEditing({ id: project.id, slot: project.slot, image_url: project.image_url });
    setTitle(project.title); setDescription(project.description ?? ""); setYarnName(project.yarn_name ?? ""); setYarnBrand(project.yarn_brand ?? ""); setImageFile(null); setPreviewUrl(await getProjectImageUrl(project.image_url)); setMessage("");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!isProjectImageFile(file)) { setMessage(t.imageError); return; }
    setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !title.trim() || (!editing.image_url && !imageFile)) { setMessage(t.required); return; }
    const slot = editing.slot ?? [1, 2, 3, 4, 5, 6].find((candidate) => !projects.some((project) => project.slot === candidate));
    if (!slot) { setMessage(t.limit); return; }
    setSaving(true); setMessage("");
    let imagePath = editing.image_url;
    if (imageFile) {
      const uploaded = await uploadProjectImage(userId, imageFile);
      if (uploaded.error || !uploaded.path) { setSaving(false); setMessage(t.error); return; }
      imagePath = uploaded.path;
    }
    const payload = { user_id: userId, slot, title: title.trim(), description: description.trim() || null, yarn_name: yarnName.trim() || null, yarn_brand: yarnBrand.trim() || null, image_url: imagePath! };
    const result = editing.id
      ? await supabase.from("projects").update(payload).eq("id", editing.id).eq("user_id", userId)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (result.error) {
      if (imageFile && imagePath) await removeProjectImage(imagePath, userId);
      setMessage(result.error.code === "23505" ? t.limit : t.error);
      return;
    }
    if (imageFile && editing.image_url && editing.image_url !== imagePath) await removeProjectImage(editing.image_url, userId);
    setEditing(null); setImageFile(null); setPreviewUrl(null); await loadProjects();
  }

  async function removeProject(project: Project) {
    if (!window.confirm(language === "pl" ? "Usunąć ten projekt?" : "Delete this project?")) return;
    setDeletingId(project.id); setMessage("");
    const { error } = await supabase.from("projects").delete().eq("id", project.id).eq("user_id", userId);
    setDeletingId(null);
    if (error) { setMessage(t.deleteError); return; }
    await removeProjectImage(project.image_url, userId); await loadProjects();
  }

  return <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-5 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">{t.title}</h2><button type="button" onClick={startNew} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F4EEF9] px-4 text-sm font-semibold text-[#7438B7]"><Plus size={17} />{t.add}</button></div>{message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}{editing ? <form onSubmit={handleSubmit} className="mt-5 rounded-2xl bg-[#FAF8FC] p-5"><label className="block text-sm font-semibold text-[#514A67]">{t.formTitle}<input value={title} maxLength={100} onChange={(event) => setTitle(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#DED6EA] bg-white px-4" /></label><label className="mt-4 block text-sm font-semibold text-[#514A67]">{t.description}<textarea value={description} maxLength={500} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#DED6EA] bg-white p-4" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#514A67]">{t.yarnName}<input value={yarnName} onChange={(event) => setYarnName(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#DED6EA] bg-white px-4" /></label><label className="block text-sm font-semibold text-[#514A67]">{t.yarnBrand}<input value={yarnBrand} onChange={(event) => setYarnBrand(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[#DED6EA] px-4" /></label></div><div className="mt-4 flex flex-wrap items-center gap-4">{previewUrl ? <img src={previewUrl} alt="" className="h-24 w-24 rounded-xl object-cover" /> : <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-white text-[#7438B7]"><ImagePlus /></span>}<label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7]">{editing.image_url ? t.change : t.choose}<input type="file" accept={PROJECT_IMAGE_TYPES.join(",")} onChange={handleImageChange} className="sr-only" /></label></div><div className="mt-5 flex flex-wrap gap-3"><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white">{saving ? <Loader2 className="animate-spin" size={17} /> : null}{t.save}</button><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#7438B7]">{t.cancel}</button></div></form> : null}{loading ? <p className="mt-5 text-sm text-[#6E6582]">{language === "pl" ? "Ładowanie…" : "Loading…"}</p> : projects.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <article key={project.id} className="overflow-hidden rounded-xl bg-[#FAF8FC]"><ProjectCard project={project} language={language} onEdit={() => void startEdit(project)} onDelete={() => void removeProject(project)} deleting={deletingId === project.id} /></article>)}</div> : <p className="mt-5 rounded-xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">{t.empty}</p>}</section>;
}

function ProjectCard({ project, language, onEdit, onDelete, deleting }: { project: Project; language: "en" | "pl"; onEdit: () => void; onDelete: () => void; deleting: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => { void getProjectImageUrl(project.image_url).then(setImageUrl); }, [project.image_url]);
  return <><div className="h-40 bg-[#F4EEF9]">{imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : null}</div><div className="p-4"><h3 className="font-bold">{project.title}</h3>{project.yarn_brand || project.yarn_name ? <p className="mt-1 text-sm text-[#6E6582]">{[project.yarn_brand, project.yarn_name].filter(Boolean).join(" · ")}</p> : null}<div className="mt-4 flex gap-2"><button onClick={onEdit} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[#7438B7]"><Pencil size={15} />{language === "pl" ? "Edytuj" : "Edit"}</button><button onClick={onDelete} disabled={deleting} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-red-600"><Trash2 size={15} />{language === "pl" ? "Usuń" : "Delete"}</button></div></div></>;
}
