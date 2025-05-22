import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Image } from '@react-pdf/renderer';
import { createDefaultFilename } from 'utils/export-utils';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #888',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoContainer: {
    width: 80,
  },
  logo: {
    width: 60,
    height: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    borderRightStyle: 'solid',
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'left',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
  metadata: {
    fontSize: 10,
    color: 'grey',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  infoBox: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    marginVertical: 10,
  }
});

interface PDFGeneratorProps {
  title: string;
  documentType: 'client-report' | 'training-program' | 'nutrition-plan' | 'progress-report' | 'business-metrics';
  data: any;
  metadata?: {
    generatedBy?: string;
    generatedFor?: string;
    date?: string;
  };
}

export const TrainingProgramPDF = ({ title, data, metadata }: PDFGeneratorProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.logoContainer}>
          {/* Logo would go here - using placeholder text */}
          <Text style={{ fontSize: 10 }}>NGX Performance</Text>
        </View>
      </View>

      {metadata && (
        <View style={styles.metadata}>
          {metadata.generatedFor && <Text>Client: {metadata.generatedFor}</Text>}
          {metadata.generatedBy && <Text>Coach: {metadata.generatedBy}</Text>}
          {metadata.date && <Text>Date: {metadata.date}</Text>}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.text}>Program Type: {data.program_type}</Text>
        <Text style={styles.text}>Duration: {data.duration_weeks} weeks</Text>
        <Text style={styles.text}>Fitness Level: {data.client_fitness_level}</Text>
        <Text style={styles.text}>Schedule Type: {data.schedule_type}</Text>
        {data.equipment_required && data.equipment_required.length > 0 && (
          <Text style={styles.text}>Equipment Required: {data.equipment_required.join(', ')}</Text>
        )}
      </View>

      <Text style={styles.paragraph}>{data.description}</Text>

      {data.phases && data.phases.map((phase: any, phaseIndex: number) => (
        <View key={`phase-${phaseIndex}`}>
          <Text style={styles.sectionTitle}>{phase.name}</Text>
          <Text style={styles.text}>Duration: {phase.duration_weeks} weeks</Text>
          <Text style={styles.text}>Main Goal: {phase.main_goal}</Text>
          {phase.secondary_goals && (
            <Text style={styles.text}>Secondary Goals: {phase.secondary_goals.join(', ')}</Text>
          )}
          {phase.description && <Text style={styles.paragraph}>{phase.description}</Text>}

          {phase.weeks && phase.weeks.map((week: any, weekIndex: number) => (
            <View key={`week-${weekIndex}`}>
              <Text style={styles.subtitle}>{week.name} {week.deload ? '(Deload)' : ''}</Text>
              
              {week.days && week.days.map((day: any, dayIndex: number) => (
                <View key={`day-${dayIndex}`}>
                  <Text style={{ ...styles.text, fontWeight: 'bold' }}>{day.name}</Text>
                  {day.focus_areas && day.focus_areas.length > 0 && (
                    <Text style={styles.text}>Focus: {day.focus_areas.join(', ')}</Text>
                  )}

                  {day.exercises && day.exercises.length > 0 ? (
                    <View style={styles.table}>
                      <View style={{...styles.tableRow, ...styles.tableRowHeader}}>
                        <View style={{...styles.tableCol, width: '25%'}}>
                          <Text style={styles.tableHeaderCell}>Exercise</Text>
                        </View>
                        <View style={{...styles.tableCol, width: '15%'}}>
                          <Text style={styles.tableHeaderCell}>Sets x Reps</Text>
                        </View>
                        <View style={{...styles.tableCol, width: '15%'}}>
                          <Text style={styles.tableHeaderCell}>Rest</Text>
                        </View>
                        <View style={{...styles.tableCol, width: '15%'}}>
                          <Text style={styles.tableHeaderCell}>Weight</Text>
                        </View>
                        <View style={{...styles.tableCol, width: '30%', borderRightWidth: 0}}>
                          <Text style={styles.tableHeaderCell}>Notes</Text>
                        </View>
                      </View>

                      {day.exercises.map((exercise: any, exIndex: number) => {
                        // Find the exercise details
                        const exerciseDetails = data._exerciseDetails && 
                          data._exerciseDetails[exercise.exercise_id] ? 
                          data._exerciseDetails[exercise.exercise_id] : 
                          { name: 'Unknown Exercise' };
                        
                        return (
                          <View key={`exercise-${exIndex}`} style={styles.tableRow}>
                            <View style={{...styles.tableCol, width: '25%'}}>
                              <Text style={styles.tableCell}>{exerciseDetails.name}</Text>
                            </View>
                            <View style={{...styles.tableCol, width: '15%'}}>
                              <Text style={styles.tableCell}>{exercise.sets} x {exercise.reps}</Text>
                            </View>
                            <View style={{...styles.tableCol, width: '15%'}}>
                              <Text style={styles.tableCell}>{exercise.rest_seconds}s</Text>
                            </View>
                            <View style={{...styles.tableCol, width: '15%'}}>
                              <Text style={styles.tableCell}>
                                {exercise.weight_type && exercise.weight_value ? 
                                  `${exercise.weight_value}${exercise.weight_type === 'percentage' ? '%' : ''}` : 
                                  '-'}
                              </Text>
                            </View>
                            <View style={{...styles.tableCol, width: '30%', borderRightWidth: 0}}>
                              <Text style={styles.tableCell}>{exercise.notes || '-'}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.text}>No exercises</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Text>Generated by NexusCore - {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export const ClientReportPDF = ({ title, data, metadata }: PDFGeneratorProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.logoContainer}>
          <Text style={{ fontSize: 10 }}>NGX Performance</Text>
        </View>
      </View>

      {metadata && (
        <View style={styles.metadata}>
          {metadata.generatedFor && <Text>Client: {metadata.generatedFor}</Text>}
          {metadata.generatedBy && <Text>Coach: {metadata.generatedBy}</Text>}
          {metadata.date && <Text>Date: {metadata.date}</Text>}
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.text}>Client: {data.name}</Text>
        <Text style={styles.text}>Type: {data.type}</Text>
        <Text style={styles.text}>Status: {data.status}</Text>
        <Text style={styles.text}>Joined: {data.join_date}</Text>
      </View>

      <Text style={styles.sectionTitle}>Client Goals</Text>
      <Text style={styles.paragraph}>{data.goals || 'No goals specified'}</Text>

      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.paragraph}>{data.summary || 'No summary available'}</Text>

      {data.adherence && (
        <View>
          <Text style={styles.sectionTitle}>Adherence Metrics</Text>
          <View style={styles.table}>
            <View style={{...styles.tableRow, ...styles.tableRowHeader}}>
              <View style={{...styles.tableCol, width: '25%'}}>
                <Text style={styles.tableHeaderCell}>Metric</Text>
              </View>
              <View style={{...styles.tableCol, width: '25%'}}>
                <Text style={styles.tableHeaderCell}>Value</Text>
              </View>
              <View style={{...styles.tableCol, width: '50%', borderRightWidth: 0}}>
                <Text style={styles.tableHeaderCell}>Notes</Text>
              </View>
            </View>

            {Object.entries(data.adherence).map(([key, value]: [string, any], index) => (
              <View key={`adherence-${index}`} style={styles.tableRow}>
                <View style={{...styles.tableCol, width: '25%'}}>
                  <Text style={styles.tableCell}>{key}</Text>
                </View>
                <View style={{...styles.tableCol, width: '25%'}}>
                  <Text style={styles.tableCell}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                </View>
                <View style={{...styles.tableCol, width: '50%', borderRightWidth: 0}}>
                  <Text style={styles.tableCell}>-</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.progress && (
        <View>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.table}>
            <View style={{...styles.tableRow, ...styles.tableRowHeader}}>
              <View style={{...styles.tableCol, width: '20%'}}>
                <Text style={styles.tableHeaderCell}>Date</Text>
              </View>
              <View style={{...styles.tableCol, width: '20%'}}>
                <Text style={styles.tableHeaderCell}>Type</Text>
              </View>
              <View style={{...styles.tableCol, width: '60%', borderRightWidth: 0}}>
                <Text style={styles.tableHeaderCell}>Details</Text>
              </View>
            </View>

            {data.progress.map((item: any, index: number) => (
              <View key={`progress-${index}`} style={styles.tableRow}>
                <View style={{...styles.tableCol, width: '20%'}}>
                  <Text style={styles.tableCell}>{item.date}</Text>
                </View>
                <View style={{...styles.tableCol, width: '20%'}}>
                  <Text style={styles.tableCell}>{item.record_type}</Text>
                </View>
                <View style={{...styles.tableCol, width: '60%', borderRightWidth: 0}}>
                  <Text style={styles.tableCell}>
                    {typeof item.data === 'object' ? JSON.stringify(item.data) : item.data}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.paragraph}>{data.recommendations || 'No recommendations available'}</Text>

      <View style={styles.footer}>
        <Text>Generated by NexusCore - {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

interface PDFDownloadButtonProps {
  title: string;
  data: any;
  documentType: 'client-report' | 'training-program' | 'nutrition-plan' | 'progress-report' | 'business-metrics';
  metadata?: {
    generatedBy?: string;
    generatedFor?: string;
    date?: string;
  };
  filename?: string;
  children?: React.ReactNode;
}

/**
 * PDF Download Button component that generates and provides a download link for PDF reports
 */
export function PDFDownloadButton({
  title,
  data,
  documentType,
  metadata = {},
  filename,
  children
}: PDFDownloadButtonProps) {
  const defaultFilename = filename || createDefaultFilename(documentType);
  
  // Select the correct PDF template based on document type
  const getPDFDocument = () => {
    switch (documentType) {
      case 'training-program':
        return <TrainingProgramPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
      case 'client-report':
        return <ClientReportPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
      // Add other document types here as they are implemented
      default:
        return <ClientReportPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
    }
  };

  return (
    <PDFDownloadLink
      document={getPDFDocument()}
      fileName={`${defaultFilename}.pdf`}
      style={{
        textDecoration: 'none',
        display: 'inline-block'
      }}
    >
      {({ blob, url, loading, error }) => 
        children || (
          <Button disabled={loading}>
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        )
      }
    </PDFDownloadLink>
  );
}

/**
 * PDFPreview component for displaying PDF previews in the app
 */
export function PDFPreview({
  title,
  data,
  documentType,
  metadata = {}
}: PDFGeneratorProps) {
  // Select the correct PDF template based on document type
  const getPDFDocument = () => {
    switch (documentType) {
      case 'training-program':
        return <TrainingProgramPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
      case 'client-report':
        return <ClientReportPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
      // Add other document types here as they are implemented
      default:
        return <ClientReportPDF title={title} documentType={documentType} data={data} metadata={metadata} />;
    }
  };

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-0">
        {getPDFDocument()}
      </PDFViewer>
    </div>
  );
}
