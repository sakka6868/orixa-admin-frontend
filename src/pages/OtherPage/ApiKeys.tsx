import ApiKeyTable from "../../components/api-keys/ApiKeyTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ApiKeys() {
  return (
    <div>
      <PageMeta
        title="API 密钥 | Orixa Admin"
        description="管理和查看 API 密钥"
      />
      <PageBreadcrumb pageTitle="API 密钥" />
      <ApiKeyTable />
    </div>
  );
}
