import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from 'components/ProtectedRoute';
import { Layout } from 'components/Layout';
import { Header } from 'components/Header';
import { BackButton } from "components/BackButton";
import { useSupabase } from 'utils/supabase';
import { DatabaseStatus } from 'components/DatabaseStatus';
import { Textarea } from '@/components/ui/textarea';
import brain from '@/brain/Brain';
import { toast } from 'sonner';

export default function DatabaseSetup() {
  const navigate = useNavigate();
  const [schemaData, setSchemaData] = useState(null);
  const [sqlData, setSqlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [includeSampleData, setIncludeSampleData] = useState(true);
  
  const fetchSchemaData = async () => {
    try {
      const response = await brain.get_schema_summary();
      const data = await response.json();
      setSchemaData(data);
    } catch (error) {
      console.error('Error fetching schema data:', error);
      toast.error('Error fetching schema data');
    }
  };
  
  useEffect(() => {
    fetchSchemaData();
  }, []);
  
  const generateDatabaseSchema = async () => {
    setLoading(true);
    try {
      const response = await brain.initialize_database({
        query: { include_sample_data: includeSampleData }
      });
      const data = await response.json();
      setSqlData(data);
      toast.success(data.message);
    } catch (error) {
      console.error('Error generating database schema:', error);
      toast.error('Error generating database schema');
    } finally {
      setLoading(false);
    }
  };
  
  const goToSupabase = () => {
    window.open('https://app.supabase.com', '_blank');
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <Header 
          title="Database Setup" 
          subtitle="Configure and initialize the Supabase database schema"
          actions={
            <div className="flex gap-2">
              <BackButton fallbackPath="/" />
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="includeSampleData" 
                  checked={includeSampleData} 
                  onChange={(e) => setIncludeSampleData(e.target.checked)} 
                  className="border-2 border-border rounded"
                />
                <label htmlFor="includeSampleData" className="text-sm font-mono">Include Sample Data</label>
              </div>
              <Button onClick={generateDatabaseSchema} variant="default" className="font-mono text-sm" disabled={loading}>
                {loading ? 'Generating...' : 'Generate SQL'}
              </Button>
              <Button onClick={goToSupabase} variant="outline" className="font-mono text-sm border-2">
                Open Supabase
              </Button>
            </div>
          }
        />
        
        <DatabaseStatus />
        
        <Card className="border-2 border-border overflow-hidden mb-6">
          <CardHeader className="p-4 pb-2 border-b-2 border-border">
            <CardTitle className="text-lg font-mono tracking-tight">
              NGX Database Schema
            </CardTitle>
            <CardDescription>
              The following tables will be created in your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {schemaData ? (
              <>
                <Tabs defaultValue="tables">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="tables" className="font-mono">Tables</TabsTrigger>
                    <TabsTrigger value="relationships" className="font-mono">Relationships</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tables">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono">Table Name</TableHead>
                          <TableHead className="font-mono">Description</TableHead>
                          <TableHead className="font-mono">Key Fields</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemaData.tables.map((table) => (
                          <TableRow key={table.name}>
                            <TableCell className="font-mono">{table.name}</TableCell>
                            <TableCell>{table.description}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {table.key_fields.join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="relationships">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono">From Table</TableHead>
                          <TableHead className="font-mono">To Table</TableHead>
                          <TableHead className="font-mono">Type</TableHead>
                          <TableHead className="font-mono">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemaData.relationships.map((rel, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{rel.from_table}</TableCell>
                            <TableCell className="font-mono">{rel.to_table}</TableCell>
                            <TableCell className="font-mono">{rel.type}</TableCell>
                            <TableCell>{rel.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 p-4 bg-secondary/50 rounded-md">
                  <h3 className="font-mono font-bold mb-2">Important Notes</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• This schema includes proper relationships between tables</li>
                    <li>• Row Level Security (RLS) policies are configured for all tables</li>
                    <li>• Indexes are created for optimal query performance</li>
                    <li>• All tables include created_at and updated_at timestamp tracking</li>
                  </ul>
                </div>
                
                {sqlData && (
                  <div className="mt-6">
                    <Tabs defaultValue="schema">
                      <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="schema" className="font-mono">Schema</TabsTrigger>
                        <TabsTrigger value="rls" className="font-mono">RLS Policies</TabsTrigger>
                        <TabsTrigger value="triggers" className="font-mono">Triggers</TabsTrigger>
                        {sqlData.sample_data_sql && (
                          <TabsTrigger value="sample" className="font-mono">Sample Data</TabsTrigger>
                        )}
                      </TabsList>
                      <TabsContent value="schema">
                        <div className="mb-2 text-sm">Copy this SQL and run it in the Supabase SQL Editor:</div>
                        <Textarea 
                          className="font-mono text-xs h-[300px] bg-background/50" 
                          value={sqlData.schema_sql} 
                          readOnly 
                        />
                      </TabsContent>
                      <TabsContent value="rls">
                        <div className="mb-2 text-sm">Copy these RLS policies and run them after creating the schema:</div>
                        <Textarea 
                          className="font-mono text-xs h-[300px] bg-background/50" 
                          value={sqlData.rls_policies_sql} 
                          readOnly 
                        />
                      </TabsContent>
                      <TabsContent value="triggers">
                        <div className="mb-2 text-sm">Copy these triggers and run them after creating the schema:</div>
                        <Textarea 
                          className="font-mono text-xs h-[300px] bg-background/50" 
                          value={sqlData.triggers_sql} 
                          readOnly 
                        />
                      </TabsContent>
                      {sqlData.sample_data_sql && (
                        <TabsContent value="sample">
                          <div className="mb-2 text-sm">Optional: Run this SQL to create sample data for testing visualizations:</div>
                          <Textarea 
                            className="font-mono text-xs h-[300px] bg-background/50" 
                            value={sqlData.sample_data_sql} 
                            readOnly 
                          />
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Loading schema information...
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 flex flex-col space-y-4 border-t-2 border-border">
            <div className="text-sm text-muted-foreground">
              To generate the SQL for creating this schema in your Supabase database, click the button below. 
              You will need to copy and run the SQL in the Supabase SQL Editor.
            </div>
            <Button
              onClick={generateDatabaseSchema}
              className="w-full font-mono"
              disabled={loading}
            >
              {loading ? 'Generating SQL...' : sqlData ? 'Regenerate SQL Scripts' : 'Generate Database SQL'}
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    </ProtectedRoute>
  );
}