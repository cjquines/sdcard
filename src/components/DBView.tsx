import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/agGridAlpineFont.css";
import {
  ColDef,
  ICellRendererParams,
  ValueGetterParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Flex } from "@chakra-ui/react";
import { useRef } from "react";
import { useNavigate } from "react-router";

import { useTracked } from "../lib/store";
import { Level, Sequence } from "../lib/types";
import DBActionRow from "./DBActionRow";
import { CategoryId, TagId } from "../lib/metadata";
import { DateText, LevelTag, TagTag } from "./SeqInfo";
import { Query } from "../lib/search";
import { score } from "../lib/session";

export default function DBView() {
  const gridRef = useRef<AgGridReact<Sequence>>(null);
  const allSequences = useTracked().db.sequences();
  const query = useTracked().session.query();
  const navigate = useNavigate();
  const sequences = Array.from(allSequences.values()).filter((seq) =>
    Query.pass(query, seq),
  );

  const columnDefs: ColDef<Sequence>[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      resizable: false,
      maxWidth: 30,
      lockPosition: "left",
    },
    {
      field: "level",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, Level>) =>
        value && <LevelTag level={value} />,
      sortable: true,
    },
    {
      field: "date",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, number>) =>
        value && <DateText date={value} />,
      sortable: true,
    },
    { field: "comment" },
    {
      headerName: "difficulty",
      valueGetter: ({ data }: ValueGetterParams<Sequence>) =>
        data?.categories.get(CategoryId("Difficulty")),
      sortable: true,
    },
    {
      field: "tags",
      cellRenderer: ({ value }: ICellRendererParams<Sequence, Set<TagId>>) => (
        <>
          {Array.from(value?.values() ?? []).map((tag) => (
            <TagTag key={tag} tagId={tag} />
          ))}
        </>
      ),
    },
    {
      headerName: "score",
      valueGetter: ({ data }: ValueGetterParams<Sequence>) =>
        data ? score(data) : "",
      sortable: true,
    },
  ];

  return (
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
          "--ag-cell-horizontal-padding": "0.5em",
          "--ag-icon-font-family": "agGridAlpine",
          "--ag-icon-size": "1em",
        },
        ".ag-center-cols-viewport": {
          overflowX: "clip",
        },
        ".ag-header-cell-resize": {
          background: "gray.200",
          zIndex: "1",
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
      <AgGridReact<Sequence>
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true }}
        rowData={sequences}
        rowSelection={"multiple"}
        suppressDragLeaveHidesColumns={true}
        suppressRowClickSelection={true}
        getRowId={(row) => row.data.id}
        onColumnMoved={() => {
          /* TODO console.log(e.api.getColumnDefs()) */
        }}
        onRowClicked={(row) => navigate(`/sequence/${row.data?.id}`)}
        onGridReady={() => gridRef.current?.columnApi?.autoSizeAllColumns()}
        headerHeight={30}
        rowHeight={30}
      />
    </Flex>
  );
}
