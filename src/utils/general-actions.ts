// const { table, helpers = {}, setIsPending, setLoadingRows } = options;
    
//     // Extract tag state from helpers or use a default one
//     const tagState = helpers.tag as string || "";
//     const setTagState = helpers.setTag as React.Dispatch<React.SetStateAction<string>> || (() => {});
    
//     // Helper function for action button with loading state
//     const ActionButton = ({ 
//       id, 
//       icon: Icon, 
//       label, 
//       variant = "secondary", 
//       onClick,
//       affectsAllSelectedRows = true
//     }: { 
//       id: string; 
//       icon: React.ElementType; 
//       label: string; 
//       variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
//       onClick: () => void;
//       affectsAllSelectedRows?: boolean;
//     }) => {
//       const isLoading = isPending && currentAction === id;
      
//       return (
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <Button
//               variant={variant}
//               size="icon"
//               className="size-7 border"
//               disabled={isPending}
//               onClick={() => {
//                 setIsPending(id);
//                 setCurrentAction(id);
                
//                 // Set loading state on selected rows if this action affects rows
//                 if (affectsAllSelectedRows) {
//                   const selectedRows = table.getFilteredSelectedRowModel().rows;
//                   const rowIds = selectedRows.map(row => row.id);
//                   setLoadingRows(rowIds);
//                 }
                
//                 startTransition(onClick);
//               }}
//             >
//               {isLoading ? (
//                 <Loader className="size-3.5 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Icon className="size-3.5" aria-hidden="true" />
//               )}
//             </Button>
//           </TooltipTrigger>
//           <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
//             <p>{label}</p>
//           </TooltipContent>
//         </Tooltip>
//       );
//     };

//     // Helper function for dropdown action buttons
//     const DropdownActionButton = <TValue extends string>({ 
//       id,
//       icon: Icon, 
//       label, 
//       options,
//       onValueChange,
//       affectsAllSelectedRows = true
//     }: { 
//       id: string;
//       icon: React.ElementType; 
//       label: string;
//       options: { label: string; value: TValue }[];
//       onValueChange: (value: TValue) => void;
//       affectsAllSelectedRows?: boolean;
//     }) => {
//       const isLoading = isPending && currentAction === id;
      
//       return (
//         <div className="relative inline-block">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 variant="secondary"
//                 size="icon"
//                 className="size-7 border"
//                 disabled={isPending}
//                 onClick={(e) => {
//                   // Prevent button default behavior, letting Select handle the click
//                   e.preventDefault();
//                 }}
//               >
//                 {isLoading ? (
//                   <Loader className="size-3.5 animate-spin" aria-hidden="true" />
//                 ) : (
//                   <Icon className="size-3.5" aria-hidden="true" />
//                 )}
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
//               <p>{label}</p>
//             </TooltipContent>
//           </Tooltip>
          
//           <Select
//             onValueChange={(value) => {
//               setIsPending(id);
//               setCurrentAction(id);
              
//               // Set loading state on selected rows if this action affects rows
//               if (affectsAllSelectedRows) {
//                 const selectedRows = table.getFilteredSelectedRowModel().rows;
//                 const rowIds = selectedRows.map(row => row.id);
//                 setLoadingRows(rowIds);
//               }
              
//               startTransition(() => {
//                 onValueChange(value as TValue);
//               });
//             }}
//           >
//             <SelectTrigger className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
//             <SelectContent align="center">
//               <SelectGroup>
//                 <SelectLabel>{label}</SelectLabel>
//                 <SelectSeparator />
//                 {options.map((option) => (
//                   <SelectItem key={option.value} value={option.value} className="capitalize">
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectGroup>
//             </SelectContent>
//           </Select>
//         </div>
//       );
//     };

//     return (
//       <React.Fragment>
//         {/* Status dropdown */}
//         <DropdownActionButton
//           id="update-status"
//           icon={CheckCircle2}
//           label="Update status"
//           options={tasks.status.enumValues.map(status => ({
//             label: toSentenceCase(status),
//             value: status
//           }))}
//           onValueChange={(status) => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
//             const ids = selectedRows.map(row => row.original.id);
            
//             updateTasks({
//               ids,
//               status,
//             }).then(({ error }) => {
//               if (error) {
//                 toast.error(error);
//                 return;
//               }
//               toast.success(`Tasks status updated to ${status}`);
//               setLoadingRows([]);  // Clear loading state when done
//             });
//           }}
//         />
        
//         {/* Priority dropdown */}
//         <DropdownActionButton
//           id="update-priority"
//           icon={ArrowUp}
//           label="Update priority"
//           options={tasks.priority.enumValues.map(priority => ({
//             label: toSentenceCase(priority),
//             value: priority
//           }))}
//           onValueChange={(priority) => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
//             const ids = selectedRows.map(row => row.original.id);
            
//             updateTasks({
//               ids,
//               priority,
//             }).then(({ error }) => {
//               if (error) {
//                 toast.error(error);
//                 return;
//               }
//               toast.success(`Tasks priority updated to ${priority}`);
//               setLoadingRows([]);  // Clear loading state when done
//             });
//           }}
//         />
        
//         <ActionButton
//           id="export"
//           icon={Download}
//           label="Export tasks"
//           affectsAllSelectedRows={false}  // Export doesn't change row data
//           onClick={() => {
//             exportTableToCSV(table, {
//               excludeColumns: ["select", "actions"],
//               onlySelected: true,
//             });
            
//             toast.success("Tasks exported to CSV");
//             setCurrentAction(null);  // Clear action state when done
//           }}
//         />
        
//         <ActionButton
//           id="copy"
//           icon={ClipboardCopy}
//           label="Copy to clipboard"
//           affectsAllSelectedRows={false}  // Copy doesn't change row data
//           onClick={() => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
//             const selectedData = selectedRows.map(row => {
//               const data = { ...row.original };
//               return JSON.stringify(data, null, 2);
//             }).join("\n");
            
//             navigator.clipboard.writeText(selectedData)
//               .then(() => {
//                 toast.success("Copied data to clipboard");
//                 setCurrentAction(null);  // Clear action state when done
//               })
//               .catch(() => toast.error("Failed to copy to clipboard"));
//           }}
//         />
        
//         <ActionButton
//           id="print"
//           icon={Printer}
//           label="Print selected"
//           affectsAllSelectedRows={false}  // Print doesn't change row data
//           onClick={() => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
            
//             // Create a printable version of the selected rows
//             const printContent = `
//               <html>
//                 <head>
//                   <title>Selected Tasks</title>
//                   <style>
//                     body { font-family: Arial, sans-serif; }
//                     table { border-collapse: collapse; width: 100%; }
//                     th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//                     th { background-color: #f2f2f2; }
//                   </style>
//                 </head>
//                 <body>
//                   <h2>Selected Tasks (${selectedRows.length})</h2>
//                   <table>
//                     <thead>
//                       <tr>
//                         ${table.getAllColumns()
//                           .filter(col => col.id !== 'select' && col.id !== 'actions')
//                           .map(col => `<th>${col.columnDef.header?.toString() || col.id}</th>`)
//                           .join('')}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       ${selectedRows.map(row => `
//                         <tr>
//                           ${table.getAllColumns()
//                             .filter(col => col.id !== 'select' && col.id !== 'actions')
//                             .map(col => {
//                               const value = row.original[col.id as keyof Task];
//                               return `<td>${value !== null && value !== undefined ? value : ''}</td>`;
//                             })
//                             .join('')}
//                         </tr>
//                       `).join('')}
//                     </tbody>
//                   </table>
//                 </body>
//               </html>
//             `;
            
//             const printWindow = window.open('', '', 'height=600,width=800');
//             if (printWindow) {
//               printWindow.document.write(printContent);
//               printWindow.document.close();
//               printWindow.focus();
//               printWindow.print();
//               printWindow.close();
//               toast.success("Print job sent");
//               setCurrentAction(null);  // Clear action state when done
//             } else {
//               toast.error("Unable to open print window");
//               setCurrentAction(null);  // Clear action state when done
//             }
//           }}
//         />
        
//         <ActionButton
//           id="archive"
//           icon={Archive}
//           label="Archive tasks"
//           onClick={() => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
            
//             // Mock implementation - in a real app, you'd call your API
//             setTimeout(() => {
//               toast.success(`${selectedRows.length} tasks archived`);
//               // Clear selection after archiving
//               table.toggleAllRowsSelected(false);
//               setLoadingRows([]);  // Clear loading state when done
//               setCurrentAction(null);  // Clear action state when done
//             }, 1000);
//           }}
//         />
        
//         <ActionButton
//           id="favorite"
//           icon={Star}
//           label="Mark as favorite"
//           onClick={() => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
            
//             // Mock implementation - in a real app, you'd call your API
//             setTimeout(() => {
//               toast.success(`${selectedRows.length} tasks marked as favorite`);
//               setLoadingRows([]);  // Clear loading state when done
//               setCurrentAction(null);  // Clear action state when done
//             }, 1000);
//           }}
//         />
        
//         <Tooltip>
//           <TooltipTrigger asChild>
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button
//                   variant="secondary"
//                   size="icon"
//                   className="size-7 border"
//                 >
//                   <Tag className="size-3.5" aria-hidden="true" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent>
//                 <SheetHeader>
//                   <SheetTitle>Add tags to tasks</SheetTitle>
//                   <SheetDescription>
//                     Apply tags to better organize and filter your tasks.
//                   </SheetDescription>
//                 </SheetHeader>
//                 <div className="flex flex-col gap-4 mt-6">
//                   <div className="flex flex-row gap-2">
//                     <Input 
//                       placeholder="Enter tag name..."
//                       value={tagState}
//                       onChange={(e) => setTagState(e.target.value)}
//                     />
//                     <Button
//                       onClick={() => {
//                         if (!tagState.trim()) {
//                           toast.error("Please enter a valid tag");
//                           return;
//                         }
                        
//                         const selectedRows = table.getFilteredSelectedRowModel().rows;
                        
//                         setCurrentAction("add-tag");
//                         setLoadingRows(selectedRows.map(row => row.id));
                        
//                         // Mock implementation - in a real app, you'd call your API
//                         setTimeout(() => {
//                           toast.success(`Tag "${tagState}" applied to ${selectedRows.length} tasks`);
//                           setTagState("");
//                           setCurrentAction(null);
//                           setLoadingRows([]);
//                         }, 1000);
//                       }}
//                     >
//                       {isPending && currentAction === "add-tag" ? (
//                         <div className="flex items-center gap-1">
//                           <Loader className="size-3.5 animate-spin" aria-hidden="true" />
//                           <span>Applying...</span>
//                         </div>
//                       ) : (
//                         "Apply"
//                       )}
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {["Important", "Urgent", "Bug", "Feature", "Enhancement", "Documentation"].map((tagName) => (
//                       <Badge 
//                         key={tagName} 
//                         variant="outline" 
//                         className="cursor-pointer hover:bg-accent"
//                         onClick={() => {
//                           setTagState(tagName);
                          
//                           const selectedRows = table.getFilteredSelectedRowModel().rows;
//                           setCurrentAction(`tag-${tagName}`);
//                           setLoadingRows(selectedRows.map(row => row.id));
                          
//                           // Mock implementation - in a real app, you'd call your API
//                           setTimeout(() => {
//                             toast.success(`Tag "${tagName}" applied to ${selectedRows.length} tasks`);
//                             setCurrentAction(null);
//                             setLoadingRows([]);
//                           }, 1000);
//                         }}
//                       >
//                         {tagName}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               </SheetContent>
//             </Sheet>
//           </TooltipTrigger>
//           <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
//             <p>Add tags</p>
//           </TooltipContent>
//         </Tooltip>
        
//         <ActionButton
//           id="delete"
//           icon={Trash2}
//           label="Delete tasks"
//           variant="destructive"
//           onClick={() => {
//             const selectedRows = table.getFilteredSelectedRowModel().rows;
//             const ids = selectedRows.map(row => row.original.id);
            
//             deleteTasks({
//               ids,
//             }).then(({ error }) => {
//               if (error) {
//                 toast.error(error);
//                 setLoadingRows([]);  // Clear loading state on error
//                 return;
//               }
              
//               toast.success("Tasks deleted");
//               table.toggleAllRowsSelected(false);
//               setLoadingRows([]);  // Clear loading state when done
//             });
//           }}
//         />
//       </React.Fragment>
//     );