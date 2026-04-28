import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { useCreateModal } from "./createModalContext";
import { CollectionForm } from "./CollectionForm";
import { LinkForm } from "./LinkForm";
import { OrganizeCollectionForm } from "./OrganizeCollectionForm";
import { OrganizeLinkForm } from "./OrganizeLinkForm";

const FolderIcon = ({ active }: { active: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 2.4 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const LinkIcon = ({ active }: { active: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 2.4 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </svg>
);

export function CreateModal() {
  const { t } = useTranslation();
  const { isOpen, mode, tab, sharedUrl, preselectedCollectionId, close, setMode, setTab } =
    useCreateModal();

  const isCreating = mode === "creating";

  const tabs = [
    {
      key: "collection",
      label: isCreating
        ? t("createModal.newCollection")
        : t("createModal.addCollection"),
      icon: <FolderIcon active={tab === "collection"} />,
    },
    {
      key: "link",
      label: isCreating ? t("createModal.newLink") : t("createModal.addLink"),
      icon: <LinkIcon active={tab === "link"} />,
    },
  ];

  const toggleMode = () => {
    setMode(isCreating ? "organizing" : "creating");
  };

  const handleSuccess = () => {
    close();
  };

  const title = isCreating
    ? t("createModal.titleCreate")
    : t("createModal.titleOrganize");

  let formNode: React.ReactNode;
  if (isCreating && tab === "collection") {
    formNode = (
      <CollectionForm
        onSuccess={handleSuccess}
        preselectedCollectionIds={
          preselectedCollectionId != null ? [preselectedCollectionId] : []
        }
      />
    );
  } else if (isCreating && tab === "link") {
    formNode = (
      <LinkForm
        onSuccess={handleSuccess}
        sharedUrl={sharedUrl}
        preselectedCollectionId={preselectedCollectionId}
      />
    );
  } else if (!isCreating && tab === "collection") {
    formNode = <OrganizeCollectionForm onSuccess={handleSuccess} />;
  } else {
    formNode = <OrganizeLinkForm onSuccess={handleSuccess} />;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
      titleAlign="center"
      headerExtra={
        <div className="flex flex-col gap-3">
          <Tabs
            items={tabs}
            activeKey={tab}
            onChange={(key) => setTab(key as "collection" | "link")}
          />
          <button
            type="button"
            onClick={toggleMode}
            className="group inline-flex items-center justify-center gap-1.5 self-center text-[12px] font-medium text-text-dim transition-colors hover:text-text"
          >
            <span>
              {isCreating
                ? t("createModal.wantToOrganize")
                : t("createModal.wantToCreate")}
            </span>
            <span className="font-semibold text-primary transition-colors group-hover:brightness-110">
              {isCreating
                ? t("createModal.addExisting")
                : t("createModal.createNew")}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary transition-transform group-hover:translate-x-0.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      }
    >
      {formNode}
    </Modal>
  );
}
