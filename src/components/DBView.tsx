import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/agGridAlpineFont.css";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Flex, Tag as TagElement, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { useNavigate } from "react-router";

import { formatDate } from "../lib/dates";
import { useTracked } from "../lib/store";
import { Call, Level, Sequence, Tag } from "../lib/types";
import DBActionRow from "./DBActionRow";

export default function DBView() {
  const gridRef = useRef<AgGridReact>(null);
  const sequences = useTracked().db.sequences();
  const navigate = useNavigate();

  const columnDefs: ColDef<Sequence>[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      maxWidth: 30,
    },
    {
      field: "level",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, Level>) => (
        <TagElement>{value}</TagElement>
      ),
    },
    {
      field: "date",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, number>) =>
        !value ? null : (
          <Text color="gray" display="inline">
            <time dateTime={new Date(value).toISOString()}>
              {formatDate(value)}
            </time>
          </Text>
        ),
    },
    { field: "comment" },
    {
      field: "tags",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, Tag[]>) => (
        <>
          {value?.map((tag) => (
            <TagElement key={tag.tag}>{tag.tag}</TagElement>
          ))}
        </>
      ),
    },
    {
      field: "calls",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, Call[]>) => (
        <Text color="gray" fontSize="sm">
          {value
            ?.map((call) => call.call)
            .join(" / ")
            .slice(0, 100)}
        </Text>
      ),
    },
  ];

  return (
    <>
      <Flex
        direction="column"
        pos="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        px="8"
        py="4"
        gap="4"
        sx={{
          "&": {
            "--ag-icon-font-family": "agGridAlpine",
            "--ag-icon-size": "1em",
          },
          ".ag-center-cols-viewport": {
            overflowX: "clip",
          },
          ".ag-header-cell-text": {
            color: "gray.600",
            fontSize: "sm",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "widest",
          },
          ".ag-row:hover": {
            background: "gray.100",
          },
          ".ag-cell": {
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          },
        }}
      >
        <DBActionRow gridRef={gridRef} />
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={Object.values(sequences)}
          rowSelection={"multiple"}
          suppressRowClickSelection={true}
          suppressMovableColumns={true}
          getRowId={(row) => row.data.id}
          onRowClicked={(row) => navigate(`/sequence/${row.data.id}`)}
          onGridReady={() => gridRef.current?.columnApi?.autoSizeAllColumns()}
          headerHeight={30}
          rowHeight={30}
        />
      </Flex>
    </>
  );
}
